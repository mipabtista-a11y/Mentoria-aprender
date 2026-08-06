// ============================================
// Materiais prontos para abrir ou imprimir
// Portado do protótipo testável para o app de produção.
// ============================================

/** Gera um caça-palavras simples (horizontal, vertical e diagonal). */
export function gerarCacaPalavras(palavras, tamanho = 11) {
  const grade = Array.from({ length: tamanho }, () => Array(tamanho).fill(null));
  const direcoes = [[0, 1], [1, 0], [1, 1]];
  const cabe = (p, l, c, [dl, dc]) => {
    for (let i = 0; i < p.length; i++) {
      const nl = l + dl * i, nc = c + dc * i;
      if (nl < 0 || nl >= tamanho || nc < 0 || nc >= tamanho) return false;
      const atual = grade[nl][nc];
      if (atual && atual !== p[i]) return false;
    }
    return true;
  };
  const colocadas = [];
  for (const palavraOriginal of palavras) {
    const p = palavraOriginal.toUpperCase();
    let tentativas = 0, colocada = false;
    while (tentativas < 60 && !colocada) {
      tentativas++;
      const dir = direcoes[Math.floor(Math.random() * direcoes.length)];
      const l = Math.floor(Math.random() * tamanho);
      const c = Math.floor(Math.random() * tamanho);
      if (cabe(p, l, c, dir)) {
        for (let i = 0; i < p.length; i++) grade[l + dir[0] * i][c + dir[1] * i] = p[i];
        colocadas.push(palavraOriginal);
        colocada = true;
      }
    }
  }
  const alfabeto = "AEIOUBCDFGHLMNPRST";
  for (let l = 0; l < tamanho; l++)
    for (let c = 0; c < tamanho; c++)
      if (!grade[l][c]) grade[l][c] = alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return { grade, colocadas };
}

// Materiais fixos, prontos para usar sem preparo — chave pelo título do jogo em biblioteca.js.
export const MATERIAIS_PRONTOS = {
  "Detetive de Erros": {
    tipo: "texto_erros",
    texto: "No sabado de manhã, a família foi passear no parque perto de caza. Ana levou sua bicicleta nova e o irmão foi de patinete. Eles pararam numa barraca de frutas e compraram maçã verde e banana madura para o lanxe. No caminho de volta, encontraram um cachorro perdido e decidiram ajudar a achar o dono dele.",
    erros: ["sabado → sábado", "caza → casa", "lanxe → lanche"],
  },
  "Caça-Palavras Personalizado": {
    tipo: "cacapalavras",
    palavrasPadrao: ["GATO", "SOL", "LUA", "CASA", "BOLA", "MAR", "FLOR", "LIVRO"],
  },
  "Jogo da Memória com Letras": {
    tipo: "cartas_pares",
    pares: [["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"]],
  },
  "Sequência com Objetos": {
    tipo: "sequencia",
    linhas: [
      { simbolos: ["●", "○", "●", "○", "●", "○", "?", "?"], dica: "Continue o padrão (2 símbolos se repetindo)." },
      { simbolos: ["■", "■", "▲", "■", "■", "▲", "?", "?", "?"], dica: "Continue o padrão (3 símbolos se repetindo)." },
      { simbolos: ["▲", "●", "●", "▲", "●", "●", "?", "?", "?"], dica: "Continue o padrão (mais difícil)." },
    ],
  },
  "Semáforo das Regras": {
    tipo: "cartas_cor",
    cartas: [
      { cor: "#2E7D32", nome: "Verde", regra: "Pode andar / fazer o movimento combinado" },
      { cor: "#E8A93C", nome: "Amarelo", regra: "Vai devagar / se prepara para parar" },
      { cor: "#C0392B", nome: "Vermelho", regra: "Para completamente" },
    ],
  },
  "Linha do Tempo do Dia": {
    tipo: "cartas_texto",
    cartas: ["Acordar", "Café da manhã", "Ir para a escola", "Almoço", "Tarde em casa", "Jantar", "Hora de dormir"],
  },
  "Missão Passo a Passo": {
    tipo: "tiras",
    titulo: "Dobrar um avião de papel",
    tiras: [
      "1. Dobre a folha ao meio, no sentido do comprimento, e abra de novo.",
      "2. Dobre os dois cantos superiores para dentro, até a linha do meio.",
      "3. Dobre as pontas novamente para dentro, formando um triângulo mais fino.",
      "4. Dobre o avião ao meio, no sentido do comprimento.",
      "5. Dobre uma asa para baixo, alinhando com a base.",
      "6. Vire e dobre a outra asa da mesma forma.",
      "7. Abra as duas asas para os lados.",
      "8. Pronto — é hora de lançar e ver até onde ele vai!",
    ],
  },
};

export function materialProntoDe(jogo) {
  return jogo ? MATERIAIS_PRONTOS[jogo.titulo] : null;
}
