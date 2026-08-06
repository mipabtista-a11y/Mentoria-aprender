import React, { useState } from "react";
import { Heart, ChevronLeft, Printer, Scissors } from "lucide-react";
import { gerarCacaPalavras, materialProntoDe } from "./materiaisProntos.js";

const GREEN = "#4C6144";
const SAGE = "#829473";
const CORAL = "#E78A6B";
const INK = "#3A3530";
const MUTED = "#8A8378";
const LINE = "#E3DBC9";

/** Folha limpa, pronta para os pais aplicarem na hora ou imprimir. */
export default function FolhaAtividade({ crianca, dia, aoFechar }) {
  const jogo = dia.jogo;
  const material = materialProntoDe(jogo);
  const [gabarito, setGabarito] = useState(false);
  const [cacaPalavras] = useState(() => material?.tipo === "cacapalavras" ? gerarCacaPalavras(material.palavrasPadrao) : null);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 100, overflowY: "auto" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .folha-imprimir, .folha-imprimir * { visibility: visible; }
          .folha-imprimir { position: absolute; top: 0; left: 0; width: 100%; padding: 0 !important; }
          .nao-imprimir { display: none !important; }
        }
      `}</style>

      <div className="nao-imprimir" style={{ position: "sticky", top: 0, background: "#fff", borderBottom: `1px solid ${LINE}`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5 }}>
        <button onClick={aoFechar} style={{ background: "#EFE9DA", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={18} color={GREEN} />
        </button>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: GREEN }}>Dia {dia.dia} · {jogo?.titulo}</div>
        <button onClick={() => window.print()} style={{ background: GREEN, border: "none", borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: "#fff", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit" }}>
          <Printer size={15} /> Imprimir
        </button>
      </div>

      <div className="folha-imprimir" style={{ maxWidth: 640, margin: "0 auto", padding: "28px 22px 60px", fontFamily: "system-ui, sans-serif", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Heart size={16} color={CORAL} />
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: .6 }}>
            Mentoria A.P.R.E.N.D.E.R. · {crianca.nome}
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginTop: 14 }}>
          Dia {dia.dia} — {dia.habilidade}
        </div>
        <div style={{ fontSize: 25, fontWeight: 700, color: GREEN, margin: "4px 0 16px", lineHeight: 1.25 }}>
          {jogo?.titulo}
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 18, fontSize: 12.5, color: MUTED }}>
          <span><b style={{ color: INK }}>Objetivo:</b> {jogo?.objetivo}</span>
          <span><b style={{ color: INK }}>Tempo:</b> {jogo?.tempo}</span>
        </div>

        <div style={{ background: "#F9F7F2", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>
            Você vai precisar de
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{jogo?.materiais}</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
            Passo a passo
          </div>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {jogo?.passos.map((p, i) => <li key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{p}</li>)}
          </ol>
        </div>

        {dia.observacaoEspecifica && (
          <div style={{ background: "#FFF4EC", borderLeft: `3px solid ${CORAL}`, borderRadius: 8,
            padding: "12px 15px", marginBottom: 20, fontSize: 13, lineHeight: 1.5 }}>
            <b style={{ color: CORAL }}>Orientação para este dia:</b> {dia.observacaoEspecifica}
          </div>
        )}

        {material?.tipo === "texto_erros" && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
              Texto para aplicar — tem {material.erros.length} erros escondidos
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.9 }}>{material.texto}</div>
            <button className="nao-imprimir" onClick={() => setGabarito(!gabarito)} style={{ marginTop: 14, background: "none", border: "none", color: GREEN, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
              {gabarito ? "Esconder gabarito" : "Ver gabarito (só a Michelle vê isso)"}
            </button>
            {gabarito && (
              <div className="nao-imprimir" style={{ marginTop: 10, fontSize: 13, color: INK, background: "#F9F7F2", borderRadius: 9, padding: "10px 13px" }}>
                {material.erros.map((e, i) => <div key={i} style={{ marginBottom: 3 }}>{e}</div>)}
              </div>
            )}
          </div>
        )}

        {material?.tipo === "cacapalavras" && cacaPalavras && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12 }}>
              Encontre as palavras
            </div>
            <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${cacaPalavras.grade.length}, 1fr)`, gap: 2, marginBottom: 16, border: `1px solid ${LINE}`, padding: 8, borderRadius: 8 }}>
              {cacaPalavras.grade.map((linha, l) => linha.map((letra, c) => (
                <div key={`${l}-${c}`} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
                  {letra}
                </div>
              )))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 6 }}>Palavras para encontrar</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cacaPalavras.colocadas.map((p) => (
                <span key={p} style={{ fontSize: 13, fontWeight: 700, color: INK, background: "#F2EFE9", padding: "4px 11px", borderRadius: 8 }}>{p}</span>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 12, lineHeight: 1.5 }}>
              Dica: as palavras podem estar na horizontal, vertical ou diagonal.
            </div>
          </div>
        )}

        {material?.tipo === "cartas_pares" && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Scissors size={13} /> Recorte as cartas abaixo
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>Embaralhe viradas para baixo e joguem o jogo da memória.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {material.pares.flatMap((par) => par).map((letra, i) => (
                <div key={i} style={{ aspectRatio: "1", border: `1.5px dashed ${LINE}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: GREEN }}>
                  {letra}
                </div>
              ))}
            </div>
          </div>
        )}

        {material?.tipo === "sequencia" && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 14 }}>
              Complete o padrão
            </div>
            {material.linhas.map((linha, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, fontSize: 28, marginBottom: 5 }}>
                  {linha.simbolos.map((s, k) => (
                    <span key={k} style={{ width: 34, textAlign: "center", color: s === "?" ? "#C9C2B0" : INK }}>{s}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: MUTED }}>{linha.dica}</div>
              </div>
            ))}
          </div>
        )}

        {material?.tipo === "cartas_cor" && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Scissors size={13} /> Recorte as três cartas
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {material.cartas.map((c) => (
                <div key={c.nome} style={{ flex: "1 1 140px", border: `1.5px dashed ${LINE}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.cor, margin: "0 auto 10px" }} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{c.nome}</div>
                  <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>{c.regra}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {material?.tipo === "cartas_texto" && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Scissors size={13} /> Recorte e embaralhe as cartas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 12 }}>
              {material.cartas.map((c, i) => (
                <div key={i} style={{ border: `1.5px dashed ${LINE}`, borderRadius: 10, padding: "14px 10px", textAlign: "center", fontSize: 13, fontWeight: 700, color: INK }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {material?.tipo === "tiras" && (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Scissors size={13} /> Recorte em tiras e revele uma de cada vez
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, margin: "10px 0 4px" }}>{material.titulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {material.tiras.map((tira, i) => (
                <div key={i} style={{ border: `1.5px dashed ${LINE}`, borderRadius: 9, padding: "10px 13px", fontSize: 13 }}>
                  {tira}
                </div>
              ))}
            </div>
          </div>
        )}

        {jogo?.observar && (
          <div style={{ background: "#FAFBF8", borderLeft: `3px solid ${SAGE}`, borderRadius: 8, padding: "12px 15px", fontSize: 13, lineHeight: 1.5 }}>
            <b style={{ color: GREEN }}>Repare em:</b> {jogo.observar}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 30, fontSize: 11, color: SAGE, fontStyle: "italic" }}>
          Michelle Giannotti Baptista · Psicopedagoga
        </div>
      </div>
    </div>
  );
}
