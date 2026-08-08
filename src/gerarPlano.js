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

// Pesos: o mapeamento das habilidades é o sinal mais forte,
// e a preocupação declarada confirma ou desempata.
const PESO_MAPEAMENTO = { 2: 4, 1: 2, 0: 0 };
const PESO_PREOCUPACAO = 3;
const PESO_PREOCUPACAO_PRINCIPAL = 2; // bônus para o que aparece no texto livre

/**
 * Procura menções às habilidades no texto livre da preocupação principal.
 * Não faz interpretação clínica — só reconhece as palavras da própria ficha.
 */
function detectarNoTexto(texto) {
  if (!texto) return [];
  const t = texto.toLowerCase();
  const termos = {
    "Matemática": ["matemática", "matematica", "conta", "número", "numero", "cálculo", "calculo"],
    "Leitura": ["leitura", "ler ", "lendo"],
    "Escrita": ["escrita", "escrever", "escrevendo", "letra"],
    "Atenção": ["atenção", "atencao", "concentra", "distra", "foco"],
    "Memória": ["memória", "memoria", "esquece", "lembra"],
    "Organização": ["organiza", "bagunça", "bagunca", "perde as coisas"],
    "Linguagem": ["fala", "linguagem", "vocabulário", "vocabulario"],
    "Comportamento": ["comportamento", "agita"],
  };
  const achados = [];
  for (const [hab, palavras] of Object.entries(termos)) {
    if (palavras.some((p) => t.includes(p))) achados.push(hab);
  }
  return achados;
}

/**
 * Pontua cada habilidade da biblioteca a partir das respostas da família.
 */
export function pontuarHabilidades(triagem) {
  const pontos = Object.fromEntries(HABILIDADES_BIBLIOTECA.map((h) => [h, 0]));

  function somar(habFicha, peso) {
    const alvos = MAPA_TRIAGEM_PARA_BIBLIOTECA[habFicha] || [];
    // Quando uma habilidade da ficha vira duas do framework,
    // o peso é dividido para não inflar artificialmente.
    for (const alvo of alvos) {
      if (pontos[alvo] !== undefined) pontos[alvo] += peso / alvos.length;
    }
  }

  // 1. Mapeamento das habilidades (etapa 5 da triagem)
  for (const [hab, nivel] of Object.entries(triagem.habilidades || {})) {
    somar(hab, PESO_MAPEAMENTO[nivel] ?? 0);
  }

  // 2. "O que mais preocupa" (etapa 2)
  for (const p of triagem.oQueMaisPreocupa || []) {
    somar(p, PESO_PREOCUPACAO);
  }

  // 3. Texto livre da preocupação principal
  for (const p of detectarNoTexto(triagem.preocupacaoPrincipal)) {
    somar(p, PESO_PREOCUPACAO_PRINCIPAL);
  }

  return pontos;
}

/**
 * Escolhe até 3 habilidades para o mês.
 */
export function escolherPrioridades(pontos) {
  const ordenadas = Object.entries(pontos)
    .filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([h]) => h);

  if (ordenadas.length === 0) return ["Atenção", "Memória"];
  return ordenadas.slice(0, 3);
}

/**
 * A sessão acompanha o tempo de foco relatado, sem forçar além dele.
 */
export function calcularDuracao(tempoConcentracao) {
  switch (tempoConcentracao) {
    case "Até 5 minutos":
      return { minutos: 10, nota: "Sessões de 10 minutos: cerca de 5 minutos de atividade e o restante em conversa leve sobre o que fizeram." };
    case "10 minutos":
      return { minutos: 15, nota: "Sessões de 15 minutos, com uma pausa curta no meio." };
    case "15 minutos":
      return { minutos: 20, nota: "Sessões de 20 minutos, reservando os últimos minutos para conversar sobre a atividade." };
    case "Mais de 20 minutos":
      return { minutos: 20, nota: "Sessões de 20 minutos completos, com espaço para aumentar a dificuldade ao longo das semanas." };
    default:
      return { minutos: 20, nota: "Sessões de 20 minutos." };
  }
}

/**
 * Ordena os jogos conforme o jeito de aprender relatado.
 * Não inventa atividade: só muda qual vem primeiro.
 */
function ordenarPorEstilo(jogos, comoAprende = []) {
  const fazendo = comoAprende.includes("Aprende fazendo");
  const observando = comoAprende.includes("Aprende observando");
  const ouvindo = comoAprende.includes("Aprende ouvindo");

  return [...jogos].sort((a, b) => nota(b) - nota(a));

  function nota(jogo) {
    const texto = `${jogo.objetivo} ${jogo.materiais} ${jogo.passos.join(" ")}`.toLowerCase();
    let n = 0;
    if (fazendo && /monte|recorte|circuito|enfie|arremesse|construa|esconda/.test(texto)) n += 2;
    if (observando && /mostre|imagem|observe|olhe|cart(a|ão)|vire/.test(texto)) n += 2;
    if (ouvindo && /som|ouça|verbal|comando|hist[óo]ria|fale|conte/.test(texto)) n += 2;
    return n;
  }
}

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

  // Quando o tempo de foco é curto, ele vira um objetivo por si só.
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
  if (triagem.sociabilidade === "Tem facilidade") fortes.push("facilidade de fazer amigos");
  if (triagem.atividadeFisica === "Sim") fortes.push("pratica atividade física");
  if (triagem.extracurricular === "Sim" && triagem.qualExtracurricular) {
    fortes.push(`atividade fora da escola (${triagem.qualExtracurricular})`);
  }
  if ((triagem.comoCostuma || []).includes("Persistir")) fortes.push("persistência");
  if ((triagem.comoCostuma || []).includes("Gostar de desafios")) fortes.push("gosto por desafios");
  if ((triagem.reacaoErro || []).includes("Tenta novamente")) fortes.push("tenta novamente diante do erro");
  if (triagem.tarefasSozinho === "Sempre") fortes.push("autonomia nas tarefas");
  if (triagem.brincar === "Sim") fortes.push("brinca com frequência");

  if (!fortes.length) return "";
  return fortes.join(", ").replace(/^./, (c) => c.toUpperCase()) + ".";
}

/**
 * Sinaliza para a Michelle o que a triagem trouxe e o gerador não trata sozinho.
 */
function montarAlertas(triagem) {
  const alertas = [];

  if (triagem.temDiagnostico === "Sim" || triagem.temDiagnostico === "Em investigação") {
    alertas.push(`Diagnóstico informado: ${triagem.qualDiagnostico || "não especificado"} (${triagem.temDiagnostico.toLowerCase()}).`);
  }
  if (triagem.usaMedicacao === "Sim") {
    alertas.push(`Faz uso de medicação: ${triagem.qualMedicacao || "não especificada"}.`);
  }
  if ((triagem.acompanhamentos || []).length) {
    alertas.push(`Já acompanhada por: ${triagem.acompanhamentos.join(", ")}.`);
  }
  if (triagem.infoAdicional?.trim()) {
    alertas.push(`A família acrescentou: "${triagem.infoAdicional.trim()}"`);
  }
  if ((triagem.oQueMaisPreocupa || []).includes("Comportamento")) {
    alertas.push("A família marcou comportamento como preocupação — a biblioteca não cobre isso diretamente.");
  }
  if (triagem.tempoDificuldade === "Mais de 1 ano") {
    alertas.push("Dificuldade percebida há mais de um ano.");
  }

  return alertas;
}

/**
 * Gera o plano a partir da triagem.
 *
 * @param {object} triagem    - respostas da família (formato do TriagemForm)
 * @param {object} biblioteca - { [habilidade]: [ {titulo, objetivo, materiais, passos, tempo} ] }
 */
export function gerarPlano(triagem, biblioteca) {
  const pontos = pontuarHabilidades(triagem);
  const prioridades = escolherPrioridades(pontos);
  const duracao = calcularDuracao(triagem.tempoConcentracao);

  // Distribuição híbrida dos 4 dias:
  // 3 prioridades → a 1ª aparece 2x, as outras 1x cada
  // 2 prioridades → 2x cada
  // 1 prioridade  → 3x + 1 dia complementar
  let sequencia;
  if (prioridades.length >= 3) {
    sequencia = [prioridades[0], prioridades[1], prioridades[0], prioridades[2]];
  } else if (prioridades.length === 2) {
    sequencia = [prioridades[0], prioridades[1], prioridades[0], prioridades[1]];
  } else {
    const complementar = HABILIDADES_BIBLIOTECA.find((h) => h !== prioridades[0]) || "Memória";
    sequencia = [prioridades[0], prioridades[0], prioridades[0], complementar];
  }

  const usados = {};
  const dias = sequencia.map((habilidade, i) => {
    const jogos = ordenarPorEstilo(biblioteca[habilidade] || [], triagem.comoAprende);
    const indice = jogos.length ? (usados[habilidade] || 0) % jogos.length : 0;
    usados[habilidade] = (usados[habilidade] || 0) + 1;

    return {
      dia: i + 1,
      habilidade,
      jogo: jogos[indice] || null,
      duracao: duracao.minutos,
      prioritaria: prioridades.slice(0, 2).includes(habilidade),
    };
  });

  return {
    prioridades,
    pontuacao: pontos,
    dias,
    duracaoSessao: duracao.minutos,
    frequencia: "4 dias por semana",
    objetivos: montarObjetivos(prioridades, triagem),
    orientacoes: montarOrientacoes(triagem, duracao),
    pontosFortes: montarPontosFortes(triagem),
    alertas: montarAlertas(triagem),
    mensagemAbertura: "",
    geradoEm: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })(),
    aprovado: false,
  };
}
/**
 * Gera um novo plano levando em conta o histórico de registros:
 * - Remove atividades que a criança já fez com sucesso ("Sim")
 * - Prioriza atividades do plano anterior que ficaram pendentes (sem registro)
 */
export function gerarPlanoComHistorico(triagem, biblioteca, registrosHistorico, planoAnteriorDados) {
  const feitosComSucesso = new Set(
    (registrosHistorico || []).filter((r) => r.conseguiu === "Sim").map((r) => r.atividade)
  );
  const feitos = new Set((registrosHistorico || []).map((r) => r.atividade));
  const pendentes = new Set(
    (planoAnteriorDados?.dias || [])
      .map((d) => d.jogo?.titulo)
      .filter((titulo) => titulo && !feitos.has(titulo))
  );

  const bibliotecaAjustada = {};
  for (const [habilidade, jogos] of Object.entries(biblioteca)) {
    const disponiveis = (jogos || []).filter((j) => !feitosComSucesso.has(j.titulo));
    disponiveis.sort((a, b) => (pendentes.has(b.titulo) ? 1 : 0) - (pendentes.has(a.titulo) ? 1 : 0));
    bibliotecaAjustada[habilidade] = disponiveis.length ? disponiveis : (jogos || []);
  }

  return gerarPlano(triagem, bibliotecaAjustada);
}
