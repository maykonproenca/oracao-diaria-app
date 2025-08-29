// services/prayerUpdateService.ts
// Serviço para gerenciar atualizações inteligentes das orações
// Verifica se há mudanças e atualiza apenas o necessário

import {
    getPrayerByReleaseDate,
    getPrayersVersion,
    insertPrayer,
    needsPrayerUpdate,
    updatePrayer,
    updatePrayersVersion
} from '@/utils/db';

// Versão atual das orações no código
const CURRENT_PRAYERS_VERSION = 5;

// Orações atualizadas com datas corretas
const UPDATED_PRAYERS = [
  {
    title: 'Oração 0 - 01/01/2025',
    content: 'O começo de tudo!',
    release_date: '2025-01-01'
  },
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
    content: 'Pai, sexta-feira chegou e meu coração explode de gratidão!\n\nQue semana incrível! Obrigado por cada momento, cada pessoa, cada experiência. Pelas oportunidades que apareceram, pelos problemas que foram resolvidos, pelas alegrias que vivi. Obrigado por estar comigo em todos os momentos. Me perdoa pelas vezes que reclamei ou fui ingrato. Me ajuda a sempre ter um coração grato, que reconhece Suas bênçãos em cada detalhe da vida. Que minha gratidão seja contagiante.\n\nMinha alma bendiz o Seu nome! Em nome de Jesus, amém.',
    release_date: '2025-09-19'
  },
  {
    title: 'Oração 20 - 20/09/2025',
    content: 'Oi Pai! Mais um sábado abençoado para descansar em Você.\n\nDeus, obrigado por inventar o descanso! Me ensina a parar, a respirar, a contemplar as coisas boas da vida. Que eu possa aproveitar este dia para fazer coisas simples que me fazem bem. Uma conversa gostosa, um passeio tranquilo, um momento de silêncio. Me ajuda a não me sentir culpado por descansar. Você mesmo descansou, e se é bom para Você, é bom para mim também. Abençoa este sábado especial.\n\nNo Seu descanso eu encontro paz. Em nome de Jesus, amém.',
    release_date: '2025-09-20'
  },
  {
    title: 'Oração 21 - 21/09/2025',
    content: 'Pai, domingo chegou e eu quero me preparar bem para uma nova semana.\n\nDeus, hoje eu busco Você com um coração aberto. Prepara meu espírito para os desafios que vão vir. Me dá sabedoria para planejar bem os próximos dias. Renova minha fé, minha esperança, meu amor. Que eu possa começar segunda-feira confiante e animado. Me ajuda a colocar prioridades certas na minha vida. Que Você seja sempre o primeiro em tudo. Abençoa este tempo de preparação e comunhão.\n\nEu me preparo para uma semana vitoriosa. Em nome de Jesus, amém.',
    release_date: '2025-09-21'
  },
  {
    title: 'Oração 22 - 22/09/2025',
    content: 'Bom dia, Pai! Preciso daquela energia especial que só Você pode dar.\n\nDeus, eu acordo alguns dias meio sem vontade, mas eu sei que em Você eu encontro motivação verdadeira. Me dá energia não só para o corpo, mas para a alma também. Renova meu entusiasmo pela vida, pelo trabalho, pelos relacionamentos. Me ajuda a começar este dia com um sorriso no rosto e esperança no coração. Que Sua alegria seja minha força. Vai comigo em cada passo que eu der hoje.\n\nVocê é minha fonte de energia! Em nome de Jesus, amém.',
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
    title: 'Oração 27 - 27/09/2025',
    content: 'Oi Pai! Mais um sábado abençoado para descansar em Você.\n\nDeus, obrigado por inventar o descanso! Me ensina a parar, a respirar, a contemplar as coisas boas da vida. Que eu possa aproveitar este dia para fazer coisas simples que me fazem bem. Uma conversa gostosa, um passeio tranquilo, um momento de silêncio. Me ajuda a não me sentir culpado por descansar. Você mesmo descansou, e se é bom para Você, é bom para mim também. Abençoa este sábado especial.\n\nNo Seu descanso eu encontro paz. Em nome de Jesus, amém.',
    release_date: '2025-09-27'
  },
  {
    title: 'Oração 28 - 28/09/2025',
    content: 'Pai, domingo chegou e eu quero me preparar bem para uma nova semana.\n\nDeus, hoje eu busco Você com um coração aberto. Prepara meu espírito para os desafios que vão vir. Me dá sabedoria para planejar bem os próximos dias. Renova minha fé, minha esperança, meu amor. Que eu possa começar segunda-feira confiante e animado. Me ajuda a colocar prioridades certas na minha vida. Que Você seja sempre o primeiro em tudo. Abençoa este tempo de preparação e comunhão.\n\nEu me preparo para uma semana vitoriosa. Em nome de Jesus, amém.',
    release_date: '2025-09-28'
  },
  {
    title: 'Oração 29 - 29/09/2025',
    content: 'Bom dia, Pai! Preciso daquela energia especial que só Você pode dar.\n\nDeus, eu acordo alguns dias meio sem vontade, mas eu sei que em Você eu encontro motivação verdadeira. Me dá energia não só para o corpo, mas para a alma também. Renova meu entusiasmo pela vida, pelo trabalho, pelos relacionamentos. Me ajuda a começar este dia com um sorriso no rosto e esperança no coração. Que Sua alegria seja minha força. Vai comigo em cada passo que eu der hoje.\n\nVocê é minha fonte de energia! Em nome de Jesus, amém.',
    release_date: '2025-09-29'
  },
  {
    title: 'Oração 30 - 30/09/2025',
    content: 'Pai, mais uma terça e eu preciso aprender a ser mais paciente.\n\nSenhor, Você sabe como eu sou ansioso e quero tudo para ontem. Me ensina a ter paciência com o processo da vida. Me ajuda a entender que cada coisa tem seu tempo certo. Que eu tenha paciência comigo mesmo quando eu erro, paciência com as pessoas que são diferentes de mim, paciência com as situações que não posso controlar. Me dá a serenidade para aceitar o que não posso mudar e coragem para mudar o que posso.\n\nEu aprendo a esperar no Seu tempo. Em nome de Jesus, amém.',
    release_date: '2025-09-30'
  }
];

export type UpdateResult = {
  needsUpdate: boolean;
  updatedCount: number;
  newCount: number;
  totalCount: number;
};

/**
 * Verifica se há atualizações necessárias e aplica apenas as mudanças
 * Preserva todos os dados do usuário (streaks, configurações, etc.)
 */
export async function checkAndUpdatePrayers(): Promise<UpdateResult> {
  try {
    console.log('🔄 Verificando atualizações de orações...');
    
    // 1. Verifica a versão atual
    const currentVersion = await getPrayersVersion();
    console.log(`📊 Versão atual: ${currentVersion.version}, Nova versão: ${CURRENT_PRAYERS_VERSION}`);
    
    // 2. Se já está na versão mais recente, não precisa atualizar
    if (currentVersion.version >= CURRENT_PRAYERS_VERSION) {
      console.log('✅ Orações já estão atualizadas');
      return {
        needsUpdate: false,
        updatedCount: 0,
        newCount: 0,
        totalCount: currentVersion.prayers_count
      };
    }
    
    console.log('🔄 Aplicando atualizações...');
    
    let updatedCount = 0;
    let newCount = 0;
    
    // 3. Processa cada oração
    for (const prayer of UPDATED_PRAYERS) {
      // Verifica se a oração já existe
      const existingPrayer = await getPrayerByReleaseDate(prayer.release_date);
      
      if (existingPrayer) {
        // Oração existe, verifica se precisa atualizar
        const needsUpdate = await needsPrayerUpdate(prayer, existingPrayer.id);
        
        if (needsUpdate) {
          await updatePrayer(existingPrayer.id, prayer);
          updatedCount++;
          console.log(`🔄 Atualizada: ${prayer.title}`);
        }
      } else {
        // Oração não existe, insere nova
        await insertPrayer(prayer);
        newCount++;
        console.log(`➕ Nova: ${prayer.title}`);
      }
    }
    
    // 4. Atualiza a versão no banco
    const totalCount = UPDATED_PRAYERS.length;
    await updatePrayersVersion(CURRENT_PRAYERS_VERSION, totalCount);
    
    console.log(`✅ Atualização concluída: ${updatedCount} atualizadas, ${newCount} novas, ${totalCount} total`);
    
    return {
      needsUpdate: true,
      updatedCount,
      newCount,
      totalCount
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar/atualizar orações:', error);
    throw new Error(`Falha na atualização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para forçar uma verificação de atualização
 * Útil para testes ou quando o usuário quiser verificar manualmente
 */
export async function forceUpdateCheck(): Promise<UpdateResult> {
  console.log('🔄 Forçando verificação de atualizações...');
  return await checkAndUpdatePrayers();
}
