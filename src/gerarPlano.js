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
