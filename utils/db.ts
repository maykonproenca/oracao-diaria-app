// utils/db.ts
// SQLite (expo-sqlite API assíncrona) + helpers do app.
// Agora inclui a tabela user_settings para notificações.

import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

// Função para resetar o banco de dados em caso de problemas
export async function resetDatabase(): Promise<void> {
  try {
    if (_db) {
      await _db.closeAsync();
      _db = null;
    }
    // Força recriação do banco na próxima chamada
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
  }
}

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  
  try {
    _db = await SQLite.openDatabaseAsync('oracao-diaria.db');
    
    if (!_db) {
      throw new Error('Falha ao abrir banco de dados');
    }

    // Cria tabelas base
    await _db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS prayers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_prayer_status (
        date TEXT PRIMARY KEY,      -- 'YYYY-MM-DD'
        prayer_id INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,  -- 0 ou 1
        completed_at TEXT,
        FOREIGN KEY(prayer_id) REFERENCES prayers(id)
      );

      -- user_settings: id fixo = 1
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        notification_enabled INTEGER NOT NULL DEFAULT 0,
        notification_hour INTEGER NOT NULL DEFAULT 8,
        notification_minute INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Migração leve: adiciona coluna notif_schedule_id se não existir
    try {
      const cols = await _db.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
      const names = new Set(cols.map(c => c.name));
      if (!names.has('notif_schedule_id')) {
        await _db.execAsync(`ALTER TABLE user_settings ADD COLUMN notif_schedule_id TEXT;`);
      }
    } catch (error) {
      console.warn('Erro na migração do banco:', error);
      // Ignora: SQLite antigo sem suporte a ALTER em algum cenário raro
    }

    // Garante linha única com defaults
    await ensureUserSettingsRow();
    return _db;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    _db = null; // Reset para tentar novamente
    throw new Error(`Falha ao inicializar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/* ===================== Oracoes ===================== */

// Insere orações iniciais se o banco estiver vazio
export async function insertInitialPrayers(): Promise<void> {
  try {
    const db = await getDB();
    const count = await getPrayersCount();
    
    if (count > 0) {
      console.log(`✅ Já existem ${count} orações no banco`);
      return;
    }

    const initialPrayers = [
      {
        title: '',
        content: 'Senhor, neste novo dia que se inicia, venho diante de Ti com um coração grato e humilde. Agradeço pela vida que me deste, pela saúde que me sustentas, e por todas as bênçãos que constantemente derramas sobre mim e minha família. Que eu possa viver este dia em total dependência de Ti, buscando em primeiro lugar o Teu reino e a Tua justiça. Guia meus passos, ilumina minhas decisões, e que cada ação minha seja um reflexo do Teu amor e da Tua graça. Que eu seja um instrumento de paz e esperança para aqueles que cruzarem meu caminho hoje. Fortalece minha fé, aumenta minha confiança, e que eu nunca me esqueça de que Tu estás sempre comigo, em todos os momentos. Que este dia seja dedicado a Ti, e que tudo o que eu fizer seja para a Tua glória. Em nome de Jesus, amém.'
      },
      {
        title: '',
        content: 'Pai celestial, ao final deste dia, venho agradecer por todas as experiências vividas, pelos aprendizados recebidos, e pela Tua presença constante em minha vida. Perdoa-me pelos erros que cometi, pelas palavras que não deveria ter dito, e pelas oportunidades que deixei passar. Que eu possa descansar em paz, sabendo que Tu cuidas de mim e de todos os meus. Guarda meu sono, protege minha família, e que eu acorde amanhã renovado e pronto para servir-Te novamente. Que eu nunca perca de vista que cada dia é um presente precioso, uma nova chance de crescer em fé e amor. Que eu durma com a certeza de que Tu estás no controle de todas as coisas, e que nada pode me separar do Teu amor. Que minha mente e coração encontrem repouso em Ti, e que eu sonhe com a esperança de um novo dia cheio de possibilidades. Em nome de Jesus, amém.'
      },
      {
        title: '',
        content: 'Deus de toda graça e misericórdia, neste momento de reflexão, quero expressar minha gratidão por tudo o que Tu és e por tudo o que tens feito em minha vida. Sou grato pela família que me deste, pelos amigos que me cercam, pelo trabalho que me sustenta, e por cada pequena bênção que muitas vezes passo despercebido. Agradeço pelos desafios que me fazem crescer, pelas dificuldades que me ensinam a confiar mais em Ti, e pelas vitórias que me mostram o Teu poder. Que eu nunca me acostume com a Tua bondade, que eu sempre mantenha um coração grato, e que eu seja um canal de bênçãos para outros. Que minha vida seja um testemunho vivo da Tua graça, e que eu nunca deixe de louvar-Te por tudo. Que eu aprenda a ver as bênçãos em cada situação, mesmo nas mais difíceis, e que eu sempre tenha um espírito de gratidão. Em nome de Jesus, amém.'
      },
      {
        title: '',
        content: 'Deus de paz, que transcende todo entendimento, venho diante de Ti buscando a serenidade que só Tu podes dar. Em meio às turbulências da vida, aos ruídos do mundo, e às preocupações que me cercam, que eu encontre em Ti o refúgio seguro para minha alma. Acalma meu coração inquieto, silencia minha mente agitada, e que eu possa experimentar a paz que vem de saber que Tu estás no controle de todas as coisas. Que eu aprenda a confiar mais em Ti, a descansar em Tuas promessas, e a encontrar força na Tua presença. Que eu seja um agente de paz neste mundo conturbado, levando esperança e consolo aos que sofrem. Que eu nunca perca de vista que a verdadeira paz não vem das circunstâncias, mas da certeza de que Tu és meu Pai e que me amas incondicionalmente. Em nome de Jesus, amém.'
      },
      {
        title: '',
        content: 'Senhor, fonte de toda força e poder, reconheço que sou fraco e limitado, mas Tu és forte e ilimitado. Neste dia, preciso da Tua força para enfrentar os desafios que se apresentam, para superar as dificuldades que surgem, e para perseverar quando tudo parece difícil. Dá-me coragem para enfrentar meus medos, sabedoria para tomar as decisões certas, e perseverança para não desistir diante dos obstáculos. Que eu confie em Ti completamente, sabendo que Tu és minha rocha e meu refúgio. Que eu encontre força na Tua palavra, poder na Tua presença, e motivação no Teu amor. Que eu seja um exemplo de fé e determinação para outros, mostrando que com Ti posso todas as coisas. Que eu nunca me esqueça de que Tu és minha força e meu escudo, e que em Ti sou mais que vencedor. Em nome de Jesus, amém.'
      }
    ];

    for (const prayer of initialPrayers) {
      await db.runAsync(
        'INSERT INTO prayers (title, content) VALUES (?, ?)',
        [prayer.title, prayer.content]
      );
    }
    
    console.log('✅ Orações iniciais inseridas com sucesso');
  } catch (error) {
    console.error('Erro ao inserir orações iniciais:', error);
    // Não re-throw para não quebrar o app
  }
}

export async function getPrayersCount(): Promise<number> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM prayers');
    return rows?.[0]?.count ?? 0;
  } catch (error) {
    console.error('Erro ao contar orações:', error);
    return 0;
  }
}

export async function getPrayerById(id: number): Promise<{ id: number; title: string; content: string } | null> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ id: number; title: string; content: string }>(
      'SELECT id, title, content FROM prayers WHERE id = ?',
      [id]
    );
    return rows?.[0] ?? null;
  } catch (error) {
    console.error('Erro ao buscar oração por ID:', error);
    return null;
  }
}

/* ===================== Status do dia ===================== */

export async function getDayStatus(dateKey: string): Promise<{ date: string; prayer_id: number; completed: number } | null> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ date: string; prayer_id: number; completed: number }>(
    'SELECT date, prayer_id, completed FROM daily_prayer_status WHERE date = ?',
    [dateKey]
  );
  return rows?.[0] ?? null;
}

export async function upsertDayStatus(dateKey: string, prayerId: number, completed: 0 | 1): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO daily_prayer_status(date, prayer_id, completed, completed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET prayer_id=excluded.prayer_id, completed=excluded.completed, completed_at=excluded.completed_at;`,
    [dateKey, prayerId, completed, completed ? now : null]
  );
}

/* ===================== Estatísticas ===================== */

export async function getBasicStats(): Promise<{ totalCompleted: number; longestStreak: number; }> {
  const db = await getDB();

  const totalRows = await db.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM daily_prayer_status WHERE completed = 1'
  );
  const totalCompleted = totalRows?.[0]?.count ?? 0;

  const days = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM daily_prayer_status WHERE completed = 1 ORDER BY date ASC'
  );

  let longest = 0;
  let current = 0;
  let prev: string | null = null;
  for (const row of days) {
    if (prev && isNextDay(prev, row.date)) current += 1;
    else current = 1;
    longest = Math.max(longest, current);
    prev = row.date;
  }

  return { totalCompleted, longestStreak: longest };
}

export async function getCurrentStreak(today: string): Promise<number> {
  const db = await getDB();

  let streak = 0;
  let cursor = today;
  while (true) {
    const row = await db.getAllAsync<{ completed: number }>(
      'SELECT completed FROM daily_prayer_status WHERE date = ?',
      [cursor]
    );
    const done = row?.[0]?.completed === 1;
    if (!done) break;
    streak += 1;
    cursor = prevDate(cursor);
  }
  return streak;
}

/* ===================== Calendário ===================== */

export async function getCompletedMapForRange(startKey: string, endKey: string): Promise<Set<string>> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT date FROM daily_prayer_status
     WHERE completed = 1 AND date >= ? AND date <= ?`,
    [startKey, endKey]
  );
  return new Set(rows.map(r => r.date));
}

/* ===================== User Settings (Notificações) ===================== */

export type UserSettings = {
  notification_enabled: 0 | 1;
  notification_hour: number;
  notification_minute: number;
  notif_schedule_id: string | null;
};

async function ensureUserSettingsRow(): Promise<void> {
  try {
    const db = await getDB();
    const row = await db.getAllAsync<{ id: number }>('SELECT id FROM user_settings WHERE id = 1');
    if (!row || row.length === 0) {
      await db.runAsync(
        `INSERT INTO user_settings(id, notification_enabled, notification_hour, notification_minute, notif_schedule_id)
         VALUES (1, 0, 8, 0, NULL);`
      );
    }
  } catch (error) {
    console.error('Erro ao garantir linha de configurações do usuário:', error);
    // Não re-throw para não quebrar a inicialização do banco
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const db = await getDB();
    await ensureUserSettingsRow();
    const rows = await db.getAllAsync<UserSettings & { id: number }>(
      'SELECT notification_enabled, notification_hour, notification_minute, notif_schedule_id FROM user_settings WHERE id = 1'
    );
    const r = rows?.[0];
    return {
      notification_enabled: (r?.notification_enabled ?? 0) as 0 | 1,
      notification_hour: r?.notification_hour ?? 8,
      notification_minute: r?.notification_minute ?? 0,
      notif_schedule_id: r?.notif_schedule_id ?? null,
    };
  } catch (error) {
    console.error('Erro ao obter configurações do usuário:', error);
    // Retorna configurações padrão em caso de erro
    return {
      notification_enabled: 0,
      notification_hour: 8,
      notification_minute: 0,
      notif_schedule_id: null,
    };
  }
}

export async function saveUserSettings(partial: Partial<UserSettings>): Promise<void> {
  const current = await getUserSettings();
  const next: UserSettings = {
    ...current,
    ...partial,
  };
  const db = await getDB();
  await db.runAsync(
    `UPDATE user_settings
     SET notification_enabled = ?, notification_hour = ?, notification_minute = ?, notif_schedule_id = ?
     WHERE id = 1;`,
    [
      next.notification_enabled,
      next.notification_hour,
      next.notification_minute,
      next.notif_schedule_id,
    ]
  );
}

/* ===================== Helpers Internos ===================== */

function isNextDay(prevKey: string, nextKey: string): boolean {
  const prevDateObj = new Date(prevKey + 'T00:00:00');
  const nextDateObj = new Date(nextKey + 'T00:00:00');
  const diff = (nextDateObj.getTime() - prevDateObj.getTime()) / (1000 * 60 * 60 * 24);
  return diff === 1;
}

function prevDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, (m - 1), d);
  dt.setDate(dt.getDate() - 1);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, '0');
  const nd = String(dt.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}