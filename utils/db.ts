// utils/db.ts
// SQLite (expo-sqlite API assíncrona) + helpers do app.
// Agora inclui a tabela user_settings para notificações.

import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('oracao-diaria.db');

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
  } catch {
    // Ignora: SQLite antigo sem suporte a ALTER em algum cenário raro
  }

  // Garante linha única com defaults
  await ensureUserSettingsRow();
  return _db;
}

/* ===================== Oracoes ===================== */

// Insere orações iniciais se o banco estiver vazio
export async function insertInitialPrayers(): Promise<void> {
  const db = await getDB();
  const count = await getPrayersCount();
  
  if (count > 0) {
    console.log(`✅ Já existem ${count} orações no banco`);
    return;
  }

  const initialPrayers = [
    {
      title: 'Oração da Manhã',
      content: 'Senhor, agradeço por este novo dia. Que eu possa viver em gratidão e amor, seguindo Teus caminhos. Amém.'
    },
    {
      title: 'Oração da Noite',
      content: 'Pai, agradeço por este dia que passou. Perdoa meus erros e guarda meu sono. Amém.'
    },
    {
      title: 'Oração de Gratidão',
      content: 'Obrigado, Senhor, por todas as bênçãos que recebo. Que eu nunca deixe de ser grato. Amém.'
    },
    {
      title: 'Oração de Paz',
      content: 'Deus de paz, acalma meu coração e minha mente. Que eu encontre serenidade em Ti. Amém.'
    },
    {
      title: 'Oração de Força',
      content: 'Senhor, dá-me força para enfrentar os desafios deste dia. Que eu confie em Ti sempre. Amém.'
    }
  ];

  for (const prayer of initialPrayers) {
    await db.runAsync(
      'INSERT INTO prayers (title, content) VALUES (?, ?)',
      [prayer.title, prayer.content]
    );
  }
  
  console.log('✅ Orações iniciais inseridas com sucesso');
}

export async function getPrayersCount(): Promise<number> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM prayers');
  return rows?.[0]?.count ?? 0;
}

export async function getPrayerById(id: number): Promise<{ id: number; title: string; content: string } | null> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ id: number; title: string; content: string }>(
    'SELECT id, title, content FROM prayers WHERE id = ?',
    [id]
  );
  return rows?.[0] ?? null;
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
  const db = await getDB();
  const row = await db.getAllAsync<{ id: number }>('SELECT id FROM user_settings WHERE id = 1');
  if (!row || row.length === 0) {
    await db.runAsync(
      `INSERT INTO user_settings(id, notification_enabled, notification_hour, notification_minute, notif_schedule_id)
       VALUES (1, 0, 8, 0, NULL);`
    );
  }
}

export async function getUserSettings(): Promise<UserSettings> {
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