// ============================================
// Gerador de plano da Mentoria A.P.R.E.N.D.E.R.
// Entrada: triagem preenchida pela família
// Saída: rascunho de plano semanal para a Michelle revisar
// ============================================

// A triagem usa a linguagem da família ("Matemática", "Leitura").
// A biblioteca usa o framework das 10 habilidades. Este mapa liga os dois.
export const MAPA_TRIAGEM_PARA_BIBLIOTECA = {
  "Atenção": ["Atenção"],
  "Memória": ["Memória"],
  "Linguagem": ["Linguagem"],
  "Organização": ["Funções executivas", "Orientação temporal"],
  "Coordenação motora": ["Coordenação motora"],
  "Leitura": ["Linguagem", "Percepção"],
  "Escrita": ["Linguagem", "Coordenação motora"],
  "Matemática": ["Raciocínio lógico matemático"],
  "Autonomia": ["Funções executivas"],
  "Controle emocional": ["Funções executivas"],
};

export const HABILIDADES_BIBLIOTECA = [
  "Atenção", "Memória", "Percepção", "Orientação espacial", "Orientação temporal",
  "Coordenação motora", "Dominância lateral", "Funções executivas", "Linguagem",
  "Raciocínio lógico matemático",
];

// Pesos: o mapeamento das habilidades e o sinal mais forte,
// e a preocupação declarada confirma ou desempata.
const PESO_MAPEAMENTO = { 2: 4, 1: 2, 0: 0 };
const PESO_PREOCUPACAO = 3;
const PESO_PREOCUPACAO

// Objetivos escritos por habilidade, para o texto não sair genérico.
const OBJETIVOS_POR_HABILIDADE = {
  "Atenção": "Aumentar o tempo de atenção sustentada em tarefas de observação e leitura.",
  "Memória": "Fortalecer a memória de trabalho para reduzir a necessidade de repetição ao aprender algo novo.",
  "Percepção": "Refinar a discriminação visual e auditiva de detalhes.",
  "Orientação espacial": "Consolidar as noções de posição e direção no espaço.",
  "Orientação temporal": "Consolidar a noção de sequência e de organização do tempo na rotina.",
  "Coordenação motora": "Aprimorar o controle motor fino e a precisão do traçado.",
  "Dominância lateral": "Fortalecer a consciência corporal e a definição da lateralidade.",
  "Funções executivas": "Desenvolver o planejamento, o controle inibitório e a flexibilidade diante de mudanças.",
  "Linguagem": "Ampliar a organização da linguagem oral e escrita e a compreensão do que é lido.",
  "Raciocínio lógico matemático": "Melhorar o reconhecimento de padrões e a resolução de situações-problema do cotidiano.",
};

function montarObjetivos(prioridades, triagem) {
  const objetivos = prioridades.slice(0, 3).map(
    (h) => OBJETIVOS_POR_HABILIDADE[h] || `Desenvolver ${h.toLowerCase()}.`
  );

  if (["Até 5 minutos", "10 minutos"].includes(triagem.tempoConcentracao)) {
    objetivos.push(`Ampliar gradualmente o tempo de permanência na atividade, partindo dos ${triagem.tempoConcentracao.toLowerCase()} atuais.`);
  }
  return objetivos;
}

/**
 * Orientações práticas a partir do que a família contou.
 */
export function montarOrientacoes(triagem, duracao) {
  const o = [];

  o.push(duracao.nota);

  if ((triagem.comoAprende || []).includes("Precisa repetir várias vezes")) {
    o.push("Manter a mesma estrutura de atividades por 2 a 3 semanas, aumentando apenas o nível de dificuldade — a repetição favorece a fixação neste perfil.");
  }
  if ((triagem.comoAprende || []).includes("Aprende fazendo")) {
    o.push("Sempre que possível, deixar a criança manipular o material antes de explicar a atividade.");
  }
  if ((triagem.reacaoErro || []).some((r) => ["Fica bravo", "Chora"].includes(r))) {
    o.push("Diante do erro, comentar primeiro a estratégia usada e só depois o resultado, para reduzir a frustração.");
  }
  if ((triagem.reacaoErro || []).includes("Tenta novamente")) {
    o.push("A criança tenta novamente diante do erro — vale nomear esse esforço em voz alta durante a atividade.");
  }
  if ((triagem.reacaoErro || []).includes("Não liga")) {
    o.push("Ao final de cada atividade, perguntar o que foi mais difícil, ajudando a criança a perceber o próprio processo.");
  }
  if ((triagem.comoCostuma || []).includes("Pedir ajuda")) {
    o.push("Ao pedir ajuda, esperar alguns segundos antes de responder, dando espaço para a tentativa autônoma.");
  }
  if ((triagem.comoCostuma || []).includes("Desistir facilmente")) {
    o.push("Começar cada sessão por uma tarefa que a criança já domina, para entrar na atividade com uma vitória.");
  }
  if ((triagem.comoCostuma || []).includes("Gostar de desafios")) {
    o.push("Apresentar a atividade como um desafio a superar — esse enquadre costuma engajar mais esta criança.");
  }
  if ((triagem.comoCostuma || []).includes("Ficar frustrado")) {
    o.push("Interromper a atividade antes do limite de tolerância, mesmo que ela não tenha terminado.");
  }
  if (triagem.sono === "Menos de 8h" || (triagem.dificuldades || []).includes("Cansaço da criança")) {
    o.push("Evitar o fim do dia para as atividades; priorizar o horário em que a criança está mais descansada.");
  }
  if (triagem.tempoTela === "Mais de 4h" || triagem.tempoTela === "2 a 4h") {
    o.push("Realizar a atividade antes do tempo de tela do dia, não depois.");
  }
  if (triagem.atividadeFisica === "Sim") {
    o.push("Nos dias de treino, aplicar a mentoria em outro período do dia.");
  }
  if (triagem.tarefasSozinho === "Nunca") {
    o.push("Começar as atividades junto com a criança e ir se afastando aos poucos, à medida que ela ganha segurança.");
  }
  if ((triagem.dificuldades || []).includes("Falta de tempo") || triagem.consegue20min === "Precisaremos ajustar nossa rotina") {
    o.push("Se a semana ficar apertada, manter os dias das habilidades prioritárias e adiar o dia complementar.");
  }
  if ((triagem.dificuldades || []).includes("Resistência da criança")) {
    o.push("Apresentar a atividade como jogo, sem mencionar treino ou reforço escolar.");
  }
  if ((triagem.dificuldades || []).includes("Dificuldade em manter uma rotina")) {
    o.push("Escolher dias fixos da semana e deixá-los combinados com a criança desde o início.");
  }
  if ((triagem.dificuldades || []).includes("Cansaço dos responsáveis")) {
    o.push("Preferir as atividades que não exigem preparo prévio nos dias mais corridos.");
  }
  if (triagem.melhorPeriodo && triagem.melhorPeriodo !== "Varia conforme a rotina") {
    o.push(`Período combinado com a família: ${triagem.melhorPeriodo.toLowerCase()}.`);
  }

  return o;
}

/**
 * Pontos fortes a partir do que a família marcou como bem desenvolvido.
 */
function montarPontosFortes(triagem) {
  const fortes = [];

  const bemDesenvolvidas = Object.entries(triagem.habilidades || {})
    .filter(([, nivel]) => nivel === 0)
    .map(([hab]) => hab.toLowerCase());

  if (bemDesenvolvidas.length) fortes.push(bemDesenvolvidas.join(", "));
  if (triagem.soci
