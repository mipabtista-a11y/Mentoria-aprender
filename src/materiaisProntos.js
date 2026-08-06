// ============================================
// Materiais prontos para abrir ou imprimir
// Portado do prototipo testavel para o app de producao.
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

// Materiais fixos, prontos para usar sem preparo — chave pelo titulo do jogo em biblioteca.js.
export const MATERIAIS_PRONTOS = {
  "Detetive de Erros": {
    tipo: "texto_erros",
    tex
