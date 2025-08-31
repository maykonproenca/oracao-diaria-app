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

      -- Tabela de controle de versão das orações
      CREATE TABLE IF NOT EXISTS prayers_version (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL DEFAULT 1,
        last_updated TEXT NOT NULL,
        prayers_count INTEGER NOT NULL DEFAULT 0
      );

      -- Tabela de orações (conteúdo do app)
      CREATE TABLE IF NOT EXISTS prayers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        release_date TEXT NOT NULL,
        checksum TEXT NOT NULL DEFAULT '' -- Para detectar mudanças
      );

      -- Tabela de status do usuário (dados pessoais)
      CREATE TABLE IF NOT EXISTS daily_prayer_status (
        date TEXT PRIMARY KEY,      -- 'YYYY-MM-DD'
        prayer_id INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,  -- 0 ou 1
        completed_at TEXT,
        FOREIGN KEY(prayer_id) REFERENCES prayers(id)
      );

      -- Configurações do usuário (dados pessoais)
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        notification_enabled INTEGER NOT NULL DEFAULT 0,
        notification_hour INTEGER NOT NULL DEFAULT 8,
        notification_minute INTEGER NOT NULL DEFAULT 0,
        notif_schedule_id TEXT,
        notification_schedules TEXT
      );

      -- Histórico de orações personalizadas (dados pessoais)
      CREATE TABLE IF NOT EXISTS custom_prayers_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request TEXT NOT NULL,
        generated_prayer TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Migração: adiciona coluna notif_schedule_id se não existir
    try {
      const cols = await _db.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
      const names = new Set(cols.map(c => c.name));
      if (!names.has('notif_schedule_id')) {
        await _db.execAsync(`ALTER TABLE user_settings ADD COLUMN notif_schedule_id TEXT;`);
      }
    } catch (error) {
      console.warn('Erro na migração do banco:', error);
    }

    // Migração: adiciona coluna notification_schedules se não existir
    try {
      const cols = await _db.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
      const names = new Set(cols.map(c => c.name));
      if (!names.has('notification_schedules')) {
        await _db.execAsync(`ALTER TABLE user_settings ADD COLUMN notification_schedules TEXT;`);
      }
    } catch (error) {
      console.warn('Erro na migração do banco (notification_schedules):', error);
    }

    // Migração: adiciona coluna release_date se não existir
    try {
      const cols = await _db.getAllAsync<{ name: string }>('PRAGMA table_info(prayers)');
      const names = new Set(cols.map(c => c.name));
      if (!names.has('release_date')) {
        await _db.execAsync(`ALTER TABLE prayers ADD COLUMN release_date TEXT NOT NULL DEFAULT '2025-01-01';`);
      }
    } catch (error) {
      console.warn('Erro na migração do banco (release_date):', error);
    }

    // Migração: adiciona coluna checksum se não existir
    try {
      const cols = await _db.getAllAsync<{ name: string }>('PRAGMA table_info(prayers)');
      const names = new Set(cols.map(c => c.name));
      if (!names.has('checksum')) {
        await _db.execAsync(`ALTER TABLE prayers ADD COLUMN checksum TEXT NOT NULL DEFAULT '';`);
      }
    } catch (error) {
      console.warn('Erro na migração do banco (checksum):', error);
    }

    // Garante linha única com defaults
    await ensureUserSettingsRow();
    await ensurePrayersVersionRow();
    return _db;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    _db = null; // Reset para tentar novamente
    throw new Error(`Falha ao inicializar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/* ===================== Oracoes ===================== */

// Insere orações iniciais se o banco estiver vazio (fallback)
export async function insertInitialPrayers(): Promise<void> {
  try {
    const db = await getDB();
    const count = await getPrayersCount();
    
    if (count > 0) {
      console.log(`✅ Já existem ${count} orações no banco (pulando inserção inicial)`);
      return;
    }

    const initialPrayers = [
      {
        title: 'Oração 27 - 27/08/2025',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
        release_date: '2025-08-27'
      },
      {
        title: 'Oração 28 - 28/08/2025',
        content: 'Pai, hoje eu quero entregar nas Suas mãos todos os meus sonhos e projetos.\n\nDeus, Você sabe como meu coração está cheio de planos. Algumas vezes eu me sinto perdido, sem saber por onde começar. Me dá direção para organizar melhor minha vida.\n\nMe ajuda a entender qual é a Sua vontade para cada área da minha vida. Abre as portas que precisam ser abertas e fecha as que não são para mim. Me dá paciência para esperar o tempo certo de cada coisa.\n\nQue eu não desista dos sonhos que Você colocou no meu coração, mas que também não force as situações.\n\nEu confio nos Seus planos para mim. Em nome de Jesus, amém.',
        release_date: '2025-08-28'
      },
      {
        title: 'Oração 29 - 29/08/2025',
        content: 'Pai, sexta chegou e eu só tenho motivos para te agradecer!\n\nObrigado por mais uma semana que termina com vitórias. Pelas pequenas alegrias do dia a dia, pelos sorrisos que recebi, pelas palavras de carinho que ouvi. Obrigado pelas oportunidades de crescer, mesmo através dos desafios.\n\nMe perdoa se em algum momento desta semana eu não soube reconhecer Suas bênçãos. Abençoa meu fim de semana com momentos especiais ao lado de quem eu amo. Que eu possa descansar com a certeza de que Você cuidou de tudo perfeitamente.\n\nMeu coração se enche de gratidão. Em nome de Jesus, amém.',
        release_date: '2025-08-29'
      },
      {
        title: 'Oração 30 - 30/08/2025',
        content: 'Bom dia, Pai! Sábado é dia de curtir a vida que Você me deu.\n\nDeus, obrigado por este dia especial para relaxar e aproveitar as coisas simples da vida. Me ajuda a valorizar os momentos em família, as conversas gostosas, as risadas sinceras.\n\nQue eu possa fazer hoje algo que realmente me dá prazer. Me ensina a viver o presente, sem ficar preocupado com os problemas de ontem ou as ansiedades de amanhã. Abençoa cada pessoa da minha família hoje.\n\nQue nossa casa seja um lugar de paz, amor e alegria. Eu celebro a vida ao Seu lado. Em nome de Jesus, amém.',
        release_date: '2025-08-30'
      },
      {
        title: 'Oração 31 - 31/08/2025',
        content: 'Pai, domingo chegou e meu coração quer te adorar de uma forma especial.\n\nDeus, hoje eu paro tudo para reconhecer quem Você é na minha vida. Você é meu refúgio nos dias difíceis, minha alegria nos momentos de festa, minha esperança quando tudo parece perdido.\n\nObrigado por me amar mesmo conhecendo todos os meus defeitos. Renova minha fé para a semana que vem. Me prepara para ser uma pessoa melhor, mais parecida com Jesus. Que minha vida seja um testemunho vivo do Seu amor. Recebe toda minha adoração.\n\nToda glória seja dada a Você! Em nome de Jesus, amém.',
        release_date: '2025-08-31'
      },
      {
        title: 'Oração 1 - 01/09/2025',
        content: 'Oi Pai! Hoje eu quero começar tudo de novo com Você ao meu lado.\n\nObrigado por me dar mais uma chance de recomeçar. Pai, eu ponho este novo dia nas Suas mãos. Me dá energia para enfrentar tudo que vem pela frente. Me ajuda a deixar para trás os erros do passado e a focar no que Você tem de bom para mim. Que eu possa ser uma pessoa melhor hoje. Abençoa meu trabalho, meus relacionamentos, todos os meus planos. Vai comigo em cada lugar que eu for. Eu sei que com Você eu posso tudo.\n\nEu confio neste novo começo. Em nome de Jesus, amém.',
        release_date: '2025-09-01'
      },
      {
        title: 'Oração 2 - 02/09/2025',
        content: 'Pai querido, hoje eu preciso tomar algumas decisões importantes e quero Sua ajuda.\n\nDeus, Você sabe que às vezes eu fico confuso e não sei qual caminho escolher. Me dá sabedoria para decidir certo. Me ajuda a ouvir a Sua voz no meio de tantas opções. Não quero escolher só com a emoção ou pela pressão dos outros. Quero fazer o que é melhor para minha vida e para as pessoas que amo. Ilumina minha mente, acalma meu coração. Me dá coragem para seguir o caminho que Você mostrar, mesmo quando parecer difícil.\n\nEu confio na Sua direção. Em nome de Jesus, amém.',
        release_date: '2025-09-02'
      },
      {
        title: 'Oração 3 - 03/09/2025',
        content: 'Bom dia, Pai! Estou aqui para renovar minhas forças em Você.\n\nDeus, chegamos no meio da semana e eu preciso de um novo fôlego. Às vezes eu me sinto cansado, mas eu sei que perto de Você eu encontro descanso verdadeiro. Renova minha energia, minha motivação, minha alegria. Me ajuda a não desistir dos meus sonhos. Tira o desânimo do meu coração. Me enche com Sua paz e Sua força. Que eu possa terminar esta semana melhor do que comecei. Obrigado por sempre renovar minha esperança.\n\nVocê é minha força renovadora. Em nome de Jesus, amém.',
        release_date: '2025-09-03'
      },
      {
        title: 'Oração 4 - 04/09/2025',
        content: 'Pai, hoje eu quero entregar todas as minhas necessidades nas Suas mãos.\n\nSenhor, Você conhece tudo que eu preciso antes mesmo de eu pedir. Eu entrego para Você as preocupações com dinheiro, com trabalho, com o futuro. Me dá sabedoria para cuidar bem do que eu tenho. Abre portas de oportunidades honestas para mim. Tira a ansiedade do meu coração sobre o que vai acontecer amanhã. Me ensina a viver um dia de cada vez, confiando que Você sempre vai cuidar de mim. Você é meu Pai provedor.\n\nEu descanso na Sua provisão. Em nome de Jesus, amém.',
        release_date: '2025-09-04'
      },
      {
        title: 'Oração 5 - 05/09/2025',
        content: 'Pai, chegou a sexta e meu coração está cheio de gratidão!\n\nObrigado por mais uma semana que passou. Pelas vitórias, pelos aprendizados, pelas pessoas que encontrei no caminho. Obrigado por ter estado comigo em cada momento, nos dias bons e nos difíceis. Me perdoa pelos erros que cometi. Obrigado pelo trabalho, pela família, pela saúde, por tudo que tenho. Que eu nunca me esqueça de ser grato. Abençoa meu fim de semana com momentos especiais. Você é tão bom comigo, Pai!\n\nMeu coração transborda de gratidão. Em nome de Jesus, amém.',
        release_date: '2025-09-05'
      },
      {
        title: 'Oração 6 - 06/09/2025',
        content: 'Oi Deus! Obrigado por este dia de descanso que Você me dá.\n\nPai, eu sei que o descanso é importante e que até Você descansou. Me ensina a aproveitar bem este tempo sem me sentir culpado. Que eu possa recarregar minhas energias, fazer coisas que me dão prazer, passar tempo com quem eu amo. Me ajuda a desligar das preocupações do trabalho e focar no que realmente importa. Abençoa este sábado com paz, alegria e momentos especiais. Obrigado por cuidar de tudo enquanto eu descanso.\n\nEu descanso seguro em Você. Em nome de Jesus, amém.',
        release_date: '2025-09-06'
      },
      {
        title: 'Oração 7 - 07/09/2025',
        content: 'Pai, domingo chegou e eu quero me preparar bem para a semana que vem.\n\nDeus, hoje eu busco Você de uma forma especial. Renova meu coração, minha mente, minha fé. Me prepara para os desafios que vão aparecer. Me dá sabedoria para planejar bem os próximos dias. Que eu possa começar segunda-feira descansado, confiante e cheio de esperança. Abençoa este domingo com momentos de paz, de reflexão, de comunhão com Você. Me ajuda a sempre colocar Você em primeiro lugar na minha vida.\n\nEu confio na nova semana com Você. Em nome de Jesus, amém.',
        release_date: '2025-09-07'
      },
      {
        title: 'Oração 8 - 08/09/2025',
        content: 'Bom dia, Pai! Preciso da Sua energia especial para começar esta semana.\n\nDeus, eu confesso que às vezes acordo meio desanimado, mas eu escolho começar este dia com alegria. Me dá disposição para enfrentar tudo que está pela frente. Renova minhas forças físicas, emocionais e espirituais. Me ajuda a ser produtivo, mas sem pressa. Que eu trabalhe com excelência, mas também com paz no coração. Vai comigo em cada compromisso, em cada conversa. Que Sua presença seja real na minha vida hoje.\n\nVocê é minha fonte de energia. Em nome de Jesus, amém.',
        release_date: '2025-09-08'
      },
      {
        title: 'Oração 9 - 09/09/2025',
        content: 'Pai, hoje eu quero pedir mais paciência para lidar com as situações da vida.\n\nSenhor, Você sabe como eu sou ansioso e quero que tudo aconteça rápido. Me ensina a ter paciência comigo mesmo, com as pessoas e com as circunstâncias. Me ajuda a não explodir quando as coisas não saem do meu jeito. Me dá calma para esperar no Seu tempo, que é sempre perfeito. Que eu não desista no meio do caminho quando as coisas ficarem difíceis. Renova minha paciência todos os dias.\n\nEu aprendo a esperar em Você. Em nome de Jesus, amém.',
        release_date: '2025-09-09'
      },
      {
        title: 'Oração 10 - 10/09/2025',
        content: 'Pai, hoje eu quero orar especialmente pelos meus relacionamentos.\n\nDeus, me ajuda a ser uma pessoa melhor para as pessoas que convivem comigo. Me perdoa quando sou egoísta, impaciente ou orgulhoso. Me ensina a ouvir mais e falar menos. Abençoa meu casamento, minha família, meus amigos, meus colegas de trabalho. Cura as feridas que ainda doem no meu coração. Me ajuda a perdoar quem me machucou. Que eu seja alguém que leva paz, amor e compreensão para todos os relacionamentos.\n\nO Seu amor me ensina a amar. Em nome de Jesus, amém.',
        release_date: '2025-09-10'
      },
      {
        title: 'Oração 11 - 11/09/2025',
        content: 'Pai, às vezes eu me sinto perdido. Me ajuda a entender qual é meu propósito aqui.\n\nDeus, eu sei que Você me criou com um plano especial. Me ajuda a descobrir para que eu vim ao mundo. Que talentos Você colocou em mim? Como posso servir melhor? Me dá direção para minha carreira, para meus relacionamentos, para todas as áreas da minha vida. Tira a confusão da minha mente. Me ajuda a não comparar minha vida com a dos outros. Eu quero cumprir meu propósito na terra.\n\nEu confio no Seu plano para mim. Em nome de Jesus, amém.',
        release_date: '2025-09-11'
      },
      {
        title: 'Oração 12 - 12/09/2025',
        content: 'Pai, hoje eu preciso da Sua paz. Meu coração anda muito agitado.\n\nSenhor, Você sabe de todas as preocupações que enchem minha mente. Às vezes parece que meus pensamentos não param nunca. Me ajuda a entregar tudo nas Suas mãos. Acalma meu coração ansioso. Tira o medo, a preocupação excessiva, a angústia. Me lembra que Você está cuidando de tudo. Enche meu coração com Sua paz que é diferente de qualquer coisa deste mundo. Que eu possa sentir Você bem pertinho de mim agora.\n\nA Sua paz guarda meu coração. Em nome de Jesus, amém.',
        release_date: '2025-09-12'
      },
      {
        title: 'Oração 13 - 13/09/2025',
        content: 'Pai, hoje eu quero agradecer especialmente pela família que Você me deu.\n\nObrigado por cada pessoa que faz parte da minha vida. Pela minha família, pelos amigos que são como irmãos. Cada um é um presente Seu para mim. Abençoa cada um deles hoje. Cuida da saúde, dos sonhos, dos planos de todos. Me ajuda a ser mais paciente, mais carinhoso, mais presente. Que eu saiba demonstrar meu amor e minha gratidão. Perdoa-me quando não dou valor. Que nossos momentos juntos sejam cheios de alegria.\n\nObrigado pela família que tenho. Em nome de Jesus, amém.',
        release_date: '2025-09-13'
      },
      {
        title: 'Oração 14 - 14/09/2025',
        content: 'Pai, hoje meu coração só quer te adorar e te louvar.\n\nDeus, Você é tão bom comigo! Obrigado por me amar de um jeito que eu nem consigo entender completamente. Obrigado pela vida, pela saúde, pela família, pelas oportunidades, por tudo. Mesmo quando as coisas ficam difíceis, eu sei que Você está comigo. Eu quero te adorar não só com palavras, mas com toda minha vida. Que as pessoas vejam Você através de mim. Recebe minha gratidão, meu amor, toda minha adoração.\n\nEu te amo muito, Pai! Em nome de Jesus, amém.',
        release_date: '2025-09-14'
      },
      {
        title: 'Oração 15 - 15/09/2025',
        content: 'Oi Pai! Mais uma segunda chegou e eu quero começar bem esta semana.\n\nObrigado por me dar a chance de recomeçar sempre. Pai, mesmo quando eu erro, Você me perdoa e me dá novas oportunidades. Hoje eu entrego esta semana toda para Você. Me ajuda a deixar o passado para trás e focar no presente. Renova minha esperança, minha motivação, minha alegria de viver. Que eu possa aprender coisas novas, conhecer pessoas especiais e viver momentos únicos. Vai comigo nesta nova jornada.\n\nEu confio neste recomeço. Em nome de Jesus, amém.',
        release_date: '2025-09-15'
      },
      {
        title: 'Oração 16 - 16/09/2025',
        content: 'Pai, mais uma vez eu venho pedir Sua sabedoria para as escolhas que preciso fazer.\n\nDeus, parece que toda semana aparecem decisões novas na minha vida. Algumas pequenas, outras grandes. Me ajuda a escolher sempre o que é certo. Me dá discernimento para ver além das aparências. Que eu não me deixe levar só pela emoção ou pela opinião dos outros. Quero buscar primeiro a Sua vontade. Me dá paz no coração quando eu escolher o caminho certo. Confia em mim Sua sabedoria.\n\nNas Suas mãos eu ponho minhas escolhas. Em nome de Jesus, amém.',
        release_date: '2025-09-16'
      },
      {
        title: 'Oração 17 - 17/09/2025',
        content: 'Pai, chegou a metade da semana e eu preciso renovar minhas forças.\n\nDeus, obrigado por ter me sustentado até aqui. Às vezes no meio da semana eu já me sinto cansado, mas eu sei que Você tem força suficiente para mim. Renova meu ânimo, minha disposição, minha alegria. Me ajuda a não desistir dos meus objetivos. Tira o peso das costas, a pressa do coração. Me ensina a trabalhar com tranquilidade, sabendo que Você está cuidando de tudo. Obrigado por ser minha fonte de energia.\n\nEm Você eu encontro descanso. Em nome de Jesus, amém.',
        release_date: '2025-09-17'
      },
      {
        title: 'Oração 18 - 18/09/2025',
        content: 'Pai provedor, mais uma vez eu entrego minhas necessidades nas Suas mãos.\n\nSenhor, Você sempre cuidou de mim e sei que vai continuar cuidando. Peço provisão para minha casa, para minha família. Me dá oportunidades de trabalho honesto. Me ensina a administrar bem o que eu tenho. Que eu não seja ganancioso, mas também não seja desleixado. Me ajuda a ser generoso com quem precisa. Tira a ansiedade sobre o futuro. Eu sei que enquanto eu buscar Você primeiro, nada vai me faltar.\n\nVocê é meu Pai que sempre provê. Em nome de Jesus, amém.',
        release_date: '2025-09-18'
      },
      {
        title: 'Oração 19 - 19/09/2025',
        content: 'Pai, que semana! Meu coração está transbordando de gratidão.\n\nObrigado por cada dia que passou, por cada experiência que vivi. Pelas pessoas que cruzaram meu caminho, pelas lições que aprendi, pelas vitórias que conquistei. Obrigado até pelas dificuldades, porque através delas eu cresci. Perdoa meus erros e me ajuda a ser uma pessoa melhor. Que eu nunca pare de ser grato pelo que tenho. Abençoa meu fim de semana. Que seja um tempo de alegria e descanso.\n\nMinha alma se alegra em Você. Em nome de Jesus, amém.',
        release_date: '2025-09-19'
      },
      {
        title: 'Oração 20 - 20/09/2025',
        content: 'Bom dia, Pai! Sábado chegou e eu quero descansar de verdade.\n\nDeus, obrigado por este dia especial que Você me dá para parar um pouco. Me ensina a descansar sem culpa, a aproveitar este tempo para recarregar as energias. Que eu possa fazer coisas simples que me dão prazer. Passar tempo com quem eu amo, rir, conversar, relaxar. Me ajuda a desligar das preocupações e focar no que realmente importa na vida. Abençoa este dia com momentos de paz e alegria.\n\nNo Seu amor eu encontro descanso. Em nome de Jesus, amém.',
        release_date: '2025-09-20'
      },
      {
        title: 'Oração 21 - 21/09/2025',
        content: 'Pai, domingo é dia especial de te buscar e te adorar.\n\nDeus, eu quero começar esta conversa te agradecendo por quem Você é. Você é amor, é paz, é bondade, é fidelidade. Obrigado por nunca me abandonar, mesmo quando eu me afasto. Hoje eu quero renovar meu compromisso com Você. Quero viver de um jeito que te agrade. Me ajuda a ser luz no mundo, sal na terra. Que minha vida seja um louvor constante ao Seu nome. Recebe minha adoração sincera.\n\nTodo louvor seja dado a Você! Em nome de Jesus, amém.',
        release_date: '2025-09-21'
      },
      {
        title: 'Oração 22 - 22/09/2025',
        content: 'Oi Deus! Nova segunda, nova semana, novas oportunidades!\n\nPai, eu amo estes momentos de recomeço que Você me dá. Obrigado por apagar o quadro e me deixar pintar uma nova história. Hoje eu escolho começar com alegria, com esperança, com fé. Me ajuda a não carregar os erros do passado como um peso. Que esta semana seja diferente, especial, abençoada. Renova minha motivação para sonhar, para trabalhar, para amar. Eu sei que Você tem surpresas boas preparadas para mim.\n\nEu abraço este novo começo. Em nome de Jesus, amém.',
        release_date: '2025-09-22'
      },
      {
        title: 'Oração 23 - 23/09/2025',
        content: 'Pai, parece que as decisões não param de aparecer na minha vida!\n\nSenhor, desde as pequenas escolhas do dia a dia até as grandes decisões que mudam tudo. Me ajuda a decidir sempre com sabedoria. Que eu possa pensar bem antes de escolher, mas que eu também não fique paralisado pela indecisão. Me dá coragem para tomar as decisões difíceis quando for necessário. Me ajuda a aceitar as consequências das minhas escolhas e aprender com elas. Guia cada passo que eu der.\n\nEu confio na Sua direção. Em nome de Jesus, amém.',
        release_date: '2025-09-23'
      },
      {
        title: 'Oração 24 - 24/09/2025',
        content: 'Pai, quarta-feira chegou e eu preciso de uma dose extra das Suas forças.\n\nDeus, no meio da semana às vezes bate aquele cansaço, aquele desânimo. Mas eu venho até Você para renovar minhas energias. Me enche com Sua força sobrenatural. Renova minha paixão pelo que eu faço, minha alegria de viver. Me ajuda a ver cada dia como uma nova oportunidade de crescer, de servir, de ser feliz. Tira o peso da rotina. Que cada dia seja uma aventura nova com Você.\n\nVocê renova minhas forças como águia. Em nome de Jesus, amém.',
        release_date: '2025-09-24'
      },
      {
        title: 'Oração 25 - 25/09/2025',
        content: 'Pai, hoje eu quero conversar sobre o propósito da minha vida.\n\nDeus, às vezes eu me pergunto se estou no caminho certo, se estou fazendo a diferença. Me ajuda a entender melhor para que Você me criou. Que dons e talentos posso usar para abençoar outras pessoas? Como posso servir melhor na minha família, no meu trabalho, na sociedade? Me dá clareza sobre meus próximos passos. Que eu não viva uma vida vazia, mas cheia de propósito e significado. Usa minha vida para Sua glória.\n\nEu quero viver com propósito. Em nome de Jesus, amém.',
        release_date: '2025-09-25'
      },
      {
        title: 'Oração 26 - 26/09/2025',
        content: 'Pai, sexta-feira chegou e meu coração explode de gratidão!\n\nQue semana incrível! Obrigado por cada momento, cada pessoa, cada experiência. Pelas oportunidades que apareceram, pelos problemas que foram resolvidos, pelas alegrias que vivi. Obrigado por estar comigo em todos os momentos. Me perdoa pelas vezes que reclamei ou fui ingrato. Me ajuda a sempre ter um coração grato, que reconhece Suas bênçãos em cada detalhe da vida. Que minha gratidão seja contagiante.\n\nMinha alma bendiz o Seu nome! Em nome de Jesus, amém.',
        release_date: '2025-09-26'
      },
      {
        title: 'Oração 32 - 27/09/2025',
        content: 'Oi Pai! Mais um sábado abençoado para descansar em Você.\n\nDeus, obrigado por inventar o descanso! Me ensina a parar, a respirar, a contemplar as coisas boas da vida. Que eu possa aproveitar este dia para fazer coisas simples que me fazem bem. Uma conversa gostosa, um passeio tranquilo, um momento de silêncio. Me ajuda a não me sentir culpado por descansar. Você mesmo descansou, e se é bom para Você, é bom para mim também. Abençoa este sábado especial.\n\nNo Seu descanso eu encontro paz. Em nome de Jesus, amém.',
        release_date: '2025-09-27'
      },
      {
        title: 'Oração 33 - 28/09/2025',
        content: 'Pai, domingo chegou e eu quero me preparar bem para uma nova semana.\n\nDeus, hoje eu busco Você com um coração aberto. Prepara meu espírito para os desafios que vão vir. Me dá sabedoria para planejar bem os próximos dias. Renova minha fé, minha esperança, meu amor. Que eu possa começar segunda-feira confiante e animado. Me ajuda a colocar prioridades certas na minha vida. Que Você seja sempre o primeiro em tudo. Abençoa este tempo de preparação e comunhão.\n\nEu me preparo para uma semana vitoriosa. Em nome de Jesus, amém.',
        release_date: '2025-09-28'
      },
      {
        title: 'Oração 34 - 29/09/2025',
        content: 'Bom dia, Pai! Preciso daquela energia especial que só Você pode dar.\n\nDeus, eu acordo alguns dias meio sem vontade, mas eu sei que em Você eu encontro motivação verdadeira. Me dá energia não só para o corpo, mas para a alma também. Renova meu entusiasmo pela vida, pelo trabalho, pelos relacionamentos. Me ajuda a começar este dia com um sorriso no rosto e esperança no coração. Que Sua alegria seja minha força. Vai comigo em cada passo que eu der hoje.\n\nVocê é minha fonte de energia! Em nome de Jesus, amém.',
        release_date: '2025-09-29'
      },
      {
        title: 'Oração 35 - 30/09/2025',
        content: 'Pai, mais uma terça e eu preciso aprender a ser mais paciente.\n\nSenhor, Você sabe como eu sou ansioso e quero tudo para ontem. Me ensina a ter paciência com o processo da vida. Me ajuda a entender que cada coisa tem seu tempo certo. Que eu tenha paciência comigo mesmo quando eu erro, paciência com as pessoas que são diferentes de mim, paciência com as situações que não posso controlar. Me dá a serenidade para aceitar o que não posso mudar e coragem para mudar o que posso.\n\nEu aprendo a esperar no Seu tempo. Em nome de Jesus, amém.',
        release_date: '2025-09-30'
      }
    ];

    for (const prayer of initialPrayers) {
      await db.runAsync(
        'INSERT INTO prayers (title, content, release_date) VALUES (?, ?, ?)',
        [prayer.title, prayer.content, prayer.release_date]
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

export async function getPrayerById(id: number): Promise<{ id: number; title: string; content: string; release_date: string } | null> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ id: number; title: string; content: string; release_date: string }>(
      'SELECT id, title, content, release_date FROM prayers WHERE id = ?',
      [id]
    );
    return rows?.[0] ?? null;
  } catch (error) {
    console.error('Erro ao buscar oração por ID:', error);
    return null;
  }
}

/* ===================== Histórico de Orações Personalizadas ===================== */

export async function saveCustomPrayerToHistory(request: string, generatedPrayer: string): Promise<void> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO custom_prayers_history (request, generated_prayer, created_at) VALUES (?, ?, ?)',
      [request, generatedPrayer, now]
    );
  } catch (error) {
    console.error('Erro ao salvar oração personalizada no histórico:', error);
    throw error;
  }
}

export async function getCustomPrayersHistory(): Promise<{ id: number; request: string; generated_prayer: string; created_at: string }[]> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ id: number; request: string; generated_prayer: string; created_at: string }>(
      'SELECT id, request, generated_prayer, created_at FROM custom_prayers_history ORDER BY created_at DESC'
    );
    return rows ?? [];
  } catch (error) {
    console.error('Erro ao buscar histórico de orações personalizadas:', error);
    return [];
  }
}

export async function deleteCustomPrayerFromHistory(id: number): Promise<void> {
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM custom_prayers_history WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao deletar oração personalizada do histórico:', error);
    throw error;
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
  notification_schedules: any[] | null;
};

async function ensureUserSettingsRow(): Promise<void> {
  try {
    const db = await getDB();
    const row = await db.getAllAsync<{ id: number }>('SELECT id FROM user_settings WHERE id = 1');
    if (!row || row.length === 0) {
      await db.runAsync(
        `INSERT INTO user_settings(id, notification_enabled, notification_hour, notification_minute, notif_schedule_id, notification_schedules)
         VALUES (1, 0, 8, 0, NULL, NULL);`
      );
    }
  } catch (error) {
    console.error('Erro ao garantir linha de configurações do usuário:', error);
    // Não re-throw para não quebrar a inicialização do banco
  }
}

async function ensurePrayersVersionRow(): Promise<void> {
  try {
    const db = await getDB();
    const row = await db.getAllAsync<{ id: number }>('SELECT id FROM prayers_version WHERE id = 1');
    if (!row || row.length === 0) {
      await db.runAsync(
        `INSERT INTO prayers_version(id, version, last_updated, prayers_count)
         VALUES (1, 1, ?, 0);`,
        [new Date().toISOString()]
      );
    }
  } catch (error) {
    console.error('Erro ao garantir linha de versão das orações:', error);
    // Não re-throw para não quebrar a inicialização do banco
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const db = await getDB();
    await ensureUserSettingsRow();
    const rows = await db.getAllAsync<UserSettings & { id: number }>(
      'SELECT notification_enabled, notification_hour, notification_minute, notif_schedule_id, notification_schedules FROM user_settings WHERE id = 1'
    );
    const r = rows?.[0];
    
    let notification_schedules = null;
    if (r?.notification_schedules) {
      try {
        notification_schedules = JSON.parse(r.notification_schedules);
      } catch (error) {
        console.warn('Erro ao fazer parse das configurações de notificação:', error);
      }
    }
    
    return {
      notification_enabled: (r?.notification_enabled ?? 0) as 0 | 1,
      notification_hour: r?.notification_hour ?? 8,
      notification_minute: r?.notification_minute ?? 0,
      notif_schedule_id: r?.notif_schedule_id ?? null,
      notification_schedules: notification_schedules,
    };
  } catch (error) {
    console.error('Erro ao obter configurações do usuário:', error);
    // Retorna configurações padrão em caso de erro
    return {
      notification_enabled: 0,
      notification_hour: 8,
      notification_minute: 0,
      notif_schedule_id: null,
      notification_schedules: null,
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
     SET notification_enabled = ?, notification_hour = ?, notification_minute = ?, notif_schedule_id = ?, notification_schedules = ?
     WHERE id = 1;`,
    [
      next.notification_enabled,
      next.notification_hour,
      next.notification_minute,
      next.notif_schedule_id,
      next.notification_schedules ? JSON.stringify(next.notification_schedules) : null,
    ]
  );
}

/* ===================== Controle de Versão das Orações ===================== */

export type PrayersVersion = {
  version: number;
  last_updated: string;
  prayers_count: number;
};

export async function getPrayersVersion(): Promise<PrayersVersion> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ version: number; last_updated: string; prayers_count: number }>(
      'SELECT version, last_updated, prayers_count FROM prayers_version WHERE id = 1'
    );
    return rows?.[0] ?? { version: 1, last_updated: new Date().toISOString(), prayers_count: 0 };
  } catch (error) {
    console.error('Erro ao buscar versão das orações:', error);
    return { version: 1, last_updated: new Date().toISOString(), prayers_count: 0 };
  }
}

export async function updatePrayersVersion(version: number, prayersCount: number): Promise<void> {
  try {
    const db = await getDB();
    await db.runAsync(
      `UPDATE prayers_version 
       SET version = ?, last_updated = ?, prayers_count = ?
       WHERE id = 1;`,
      [version, new Date().toISOString(), prayersCount]
    );
  } catch (error) {
    console.error('Erro ao atualizar versão das orações:', error);
    throw error;
  }
}

// Função para gerar checksum de uma oração
export function generatePrayerChecksum(prayer: { title: string; content: string; release_date: string }): string {
  const data = `${prayer.title}|${prayer.content}|${prayer.release_date}`;
  // Hash simples baseado no conteúdo
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Função para verificar se uma oração precisa ser atualizada
export async function needsPrayerUpdate(prayer: { title: string; content: string; release_date: string }, prayerId: number): Promise<boolean> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ checksum: string }>(
      'SELECT checksum FROM prayers WHERE id = ?',
      [prayerId]
    );
    
    if (!rows?.[0]) return true; // Oração não existe, precisa inserir
    
    const currentChecksum = rows[0].checksum;
    const newChecksum = generatePrayerChecksum(prayer);
    
    return currentChecksum !== newChecksum;
  } catch (error) {
    console.error('Erro ao verificar se oração precisa atualização:', error);
    return true; // Em caso de erro, assume que precisa atualizar
  }
}

// Função para atualizar oração específica
export async function updatePrayer(prayerId: number, prayer: { title: string; content: string; release_date: string }): Promise<void> {
  try {
    const db = await getDB();
    const checksum = generatePrayerChecksum(prayer);
    
    await db.runAsync(
      `UPDATE prayers 
       SET title = ?, content = ?, release_date = ?, checksum = ?
       WHERE id = ?;`,
      [prayer.title, prayer.content, prayer.release_date, checksum, prayerId]
    );
  } catch (error) {
    console.error('Erro ao atualizar oração:', error);
    throw error;
  }
}

// Função para inserir nova oração
export async function insertPrayer(prayer: { title: string; content: string; release_date: string }): Promise<number> {
  try {
    const db = await getDB();
    const checksum = generatePrayerChecksum(prayer);
    
    const result = await db.runAsync(
      'INSERT INTO prayers (title, content, release_date, checksum) VALUES (?, ?, ?, ?);',
      [prayer.title, prayer.content, prayer.release_date, checksum]
    );
    
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao inserir oração:', error);
    throw error;
  }
}

// Função para buscar oração por release_date
export async function getPrayerByReleaseDate(releaseDate: string): Promise<{ id: number; title: string; content: string; release_date: string } | null> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ id: number; title: string; content: string; release_date: string }>(
      'SELECT id, title, content, release_date FROM prayers WHERE release_date = ?',
      [releaseDate]
    );
    return rows?.[0] ?? null;
  } catch (error) {
    console.error('Erro ao buscar oração por data de divulgação:', error);
    return null;
  }
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