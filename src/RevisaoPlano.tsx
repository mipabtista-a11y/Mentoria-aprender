import React, { useState } from "react";
import { RefreshCw, Check, Edit3, X } from "lucide-react";

const GREEN = "#4C6144";
const CORAL = "#E78A6B";
const CARD = "#FFFFFF";
const INK = "#3A3530";
const MUTED = "#8A8378";
const LINE = "#E3DBC9";

/**
 * Tela de revisão do plano gerado.
 * A Michelle vê o rascunho, troca jogos, edita textos e só então libera.
 * Nada disso chega à família antes de ela aprovar.
 */
export default function RevisaoPlano({ crianca, plano, biblioteca, onChange, onAprovar, onRegerar, salvando }) {
  const [editando, setEditando] = useState(null); // índice do dia sendo trocado
  const [personalizando, setPersonalizando] = useState(null); // índice do dia com o formulário de atividade própria aberto
  const [rascunhoPersonalizada, setRascunhoPersonalizada] = useState(null);

  function trocarJogo(indiceDia, novoJogo) {
    const dias = plano.dias.map((d, i) => (i === indiceDia ? { ...d, jogo: novoJogo } : d));
    onChange({ ...plano, dias });
    setEditando(null);
  }

  function trocarHabilidade(indiceDia, novaHabilidade) {
    const jogos = biblioteca[novaHabilidade] || [];
    const dias = plano.dias.map((d, i) =>
      i === indiceDia ? { ...d, habilidade: novaHabilidade, jogo: jogos[0] } : d
    );
    onChange({ ...plano, dias });
  }

  function abrirAtividadePersonalizada(indiceDia) {
    const atual = plano.dias[indiceDia].jogo;
    setRascunhoPersonalizada({
      titulo: "", tempo: "20 min", objetivo: "", materiais: "",
      passos: "", observar: "",
    });
    setPersonalizando(indiceDia);
    setEditando(null);
  }

  function salvarAtividadePersonalizada(indiceDia) {
    const r = rascunhoPersonalizada;
    const jogo = {
      titulo: r.titulo.trim() || "Atividade personalizada",
      tempo: r.tempo.trim(),
      objetivo: r.objetivo.trim(),
      materiais: r.materiais.trim(),
      passos: r.passos.split("\n").map((p) => p.trim()).filter(Boolean),
      observar: r.observar.trim(),
      personalizada: true,
    };
    trocarJogo(indiceDia, jogo);
    setPersonalizando(null);
    setRascunhoPersonalizada(null);
  }

  function editarObservacaoDoDia(indiceDia, texto) {
    const dias = plano.dias.map((d, i) => (i === indiceDia ? { ...d, observacaoEspecifica: texto } : d));
    onChange({ ...plano, dias });
  }

  function editarObjetivo(indice, texto) {
    const objetivos = plano.objetivos.map((o, i) => (i === indice ? texto : o));
    onChange({ ...plano, objetivos });
  }

  function removerOrientacao(indice) {
    onChange({ ...plano, orientacoes: plano.orientacoes.filter((_, i) => i !== indice) });
  }

  function editarOrientacao(indice, texto) {
    const orientacoes = plano.orientacoes.map((o, i) => (i === indice ? texto : o));
    onChange({ ...plano, orientacoes });
  }

  const alertas = plano.alertas || [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, color: GREEN }}>Revisar plano — {crianca.nome}</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>
            Gerado a partir da triagem. A família só vê depois que você aprovar.
          </div>
        </div>
        <button onClick={onRegerar} title="Gerar novamente a partir da triagem"
          style={{ background: "#EFE9DA", border: "none", borderRadius: 10, padding: "9px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: GREEN, flexShrink: 0 }}>
          <RefreshCw size={14} /> Regerar
        </button>
      </div>

      {alertas.length > 0 && (
        <div style={{ background: "#FFF4EC", border: `1px solid ${CORAL}`, borderRadius: 12,
          padding: "13px 15px", margin: "14px 0" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: CORAL, textTransform: "uppercase",
            letterSpacing: .5, marginBottom: 8 }}>
            Da triagem, para o seu olhar
          </div>
          <ul style={{ margin: 0, paddingLeft: 17 }}>
            {alertas.map((a, i) => (
              <li key={i} style={{ fontSize: 12.5, color: INK, lineHeight: 1.5, marginBottom: 4 }}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prioridades */}
      <Bloco titulo="Habilidades prioritárias">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {plano.prioridades.map((p) => (
            <span key={p} style={{ background: CORAL, color: "#fff", fontWeight: 700, fontSize: 11.5,
              padding: "6px 14px", borderRadius: 20, textTransform: "uppercase", letterSpacing: .3 }}>
              {p}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 10 }}>
          Definidas pelo que você escreveu na análise, pelo mapeamento da família e pelo que mais preocupa.
        </div>
      </Bloco>

      {/* Cronograma */}
      <Bloco titulo={`Cronograma — ${plano.duracaoSessao} min por dia, ${plano.frequencia}`}>
        {plano.dias.map((d, i) => (
          <div key={i} style={{ padding: "12px 0",
            borderBottom: i < plano.dias.length - 1 ? `1px solid #F2EDE2` : "none" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: d.prioritaria ? GREEN : "#A8B598",
                color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0 }}>
                {d.dia}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <select value={d.habilidade} onChange={(e) => trocarHabilidade(i, e.target.value)}
                  style={{ fontSize: 10.5, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: .3,
                    border: "none", background: "transparent", cursor: "pointer", padding: 0, marginBottom: 3,
                    maxWidth: "100%", fontFamily: "inherit" }}>
                  {Object.keys(biblioteca).map((h) => <option key={h} value={h}>{h}</option>)}
                </select>

                {personalizando === i ? (
                  <div style={{ marginTop: 6, background: "#F9F7F2", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase",
                      letterSpacing: .4, marginBottom: 8 }}>
                      Atividade personalizada — só para {crianca.nome}
                    </div>
                    <CampoPequeno placeholder="Nome da atividade" value={rascunhoPersonalizada.titulo}
                      onChange={(v) => setRascunhoPersonalizada({ ...rascunhoPersonalizada, titulo: v })} />
                    <CampoPequeno placeholder="Objetivo" value={rascunhoPersonalizada.objetivo}
                      onChange={(v) => setRascunhoPersonalizada({ ...rascunhoPersonalizada, objetivo: v })} />
                    <CampoPequeno placeholder="Materiais" value={rascunhoPersonalizada.materiais}
                      onChange={(v) => setRascunhoPersonalizada({ ...rascunhoPersonalizada, materiais: v })} />
                    <textarea placeholder={"Passo a passo — um por linha"} value={rascunhoPersonalizada.passos}
                      onChange={(e) => setRascunhoPersonalizada({ ...rascunhoPersonalizada, passos: e.target.value })}
                      style={{ width: "100%", padding: 9, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12.5,
                        minHeight: 64, marginBottom: 8, fontFamily: "inherit", lineHeight: 1.45 }} />
                    <CampoPequeno placeholder="O que observar (opcional)" value={rascunhoPersonalizada.observar}
                      onChange={(v) => setRascunhoPersonalizada({ ...rascunhoPersonalizada, observar: v })} />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button onClick={() => salvarAtividadePersonalizada(i)}
                        disabled={!rascunhoPersonalizada.titulo.trim()}
                        style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px",
                          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          opacity: rascunhoPersonalizada.titulo.trim() ? 1 : .5 }}>
                        Usar esta atividade
                      </button>
                      <button onClick={() => { setPersonalizando(null); setRascunhoPersonalizada(null); }}
                        style={{ background: "transparent", border: "none", color: MUTED, fontSize: 11.5,
                          cursor: "pointer", padding: 4, fontFamily: "inherit" }}>
                        cancelar
                      </button>
                    </div>
                  </div>
                ) : editando === i ? (
                  <div style={{ marginTop: 4 }}>
                    {(biblioteca[d.habilidade] || []).map((j) => (
                      <button key={j.titulo} onClick={() => trocarJogo(i, j)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 11px", marginBottom: 5,
                          borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit",
                          border: j.titulo === d.jogo?.titulo ? "none" : `1px solid ${LINE}`,
                          background: j.titulo === d.jogo?.titulo ? GREEN : "#fff",
                          color: j.titulo === d.jogo?.titulo ? "#fff" : INK }}>
                        <b>{j.titulo}</b> — {j.objetivo}
                      </button>
                    ))}
                    <button onClick={() => abrirAtividadePersonalizada(i)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 11px", marginBottom: 5,
                        borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit",
                        border: `1.5px dashed ${CORAL}`, background: "#fff", color: CORAL, fontWeight: 700 }}>
                      + Escrever uma atividade minha para este dia
                    </button>
                    <button onClick={() => setEditando(null)}
                      style={{ background: "transparent", border: "none", color: MUTED, fontSize: 11.5,
                        cursor: "pointer", padding: 4, fontFamily: "inherit" }}>
                      cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>
                        {d.jogo?.titulo || "—"}
                        {d.jogo?.personalizada && (
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: CORAL, border: `1px solid ${CORAL}`,
                            borderRadius: 6, padding: "1px 6px", marginLeft: 7, textTransform: "uppercase" }}>
                            sua
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>{d.jogo?.objetivo}</div>
                    </div>
                    <button onClick={() => setEditando(i)} title="Trocar atividade"
                      style={{ background: "#EFE9DA", border: "none", borderRadius: 8, width: 30, height: 30,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      <Edit3 size={13} color={GREEN} />
                    </button>
                  </div>
                )}

                <textarea
                  value={d.observacaoEspecifica || ""}
                  onChange={(e) => editarObservacaoDoDia(i, e.target.value)}
                  placeholder={`Orientação específica para o dia ${d.dia} (opcional) — só aparece nesse dia`}
                  style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 8, border: `1px dashed ${LINE}`,
                    fontSize: 12, minHeight: 40, fontFamily: "inherit", lineHeight: 1.4, color: INK, resize: "vertical" }} />
              </div>
            </div>
          </div>
        ))}
      </Bloco>

      {/* Objetivos */}
      <Bloco titulo="Objetivos do mês">
        {plano.objetivos.map((o, i) => (
          <textarea key={i} value={o} onChange={(e) => editarObjetivo(i, e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, fontSize: 13, minHeight: 52, marginBottom: 8,
              fontFamily: "inherit", lineHeight: 1.45, border: `1px solid ${LINE}` }} />
        ))}
        <button onClick={() => onChange({ ...plano, objetivos: [...plano.objetivos, ""] })}
          style={{ background: "transparent", border: "none", color: GREEN, fontSize: 12, fontWeight: 700,
            cursor: "pointer", padding: 4 }}>
          + adicionar objetivo
        </button>
      </Bloco>

      {/* Pontos fortes */}
      <Bloco titulo="Pontos fortes (a família lê isto primeiro)">
        <textarea value={plano.pontosFortes} onChange={(e) => onChange({ ...plano, pontosFortes: e.target.value })}
          placeholder="Escreva com suas palavras o que a família precisa ouvir primeiro."
          style={{ width: "100%", padding: 10, borderRadius: 10, fontSize: 13, minHeight: 64, fontFamily: "inherit",
            lineHeight: 1.45, border: `1px solid ${LINE}` }} />
      </Bloco>

      {/* Orientações */}
      <Bloco titulo="Orientações para os pais">
        {plano.orientacoes.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <textarea value={o} onChange={(e) => editarOrientacao(i, e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 12.5,
                minHeight: 52, fontFamily: "inherit", lineHeight: 1.45 }} />
            <button onClick={() => removerOrientacao(i)} title="Remover"
              style={{ background: "#F7EFE9", border: "none", borderRadius: 8, width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                flexShrink: 0, marginTop: 2 }}>
              <X size={13} color={CORAL} />
            </button>
          </div>
        ))}
        <button onClick={() => onChange({ ...plano, orientacoes: [...plano.orientacoes, ""] })}
          style={{ background: "transparent", border: "none", color: GREEN, fontSize: 12, fontWeight: 700,
            cursor: "pointer", padding: 4 }}>
          + adicionar orientação
        </button>
      </Bloco>

      {/* Mensagem de abertura */}
      <Bloco titulo="Mensagem de abertura para a família">
        <textarea value={plano.mensagemAbertura || ""}
          onChange={(e) => onChange({ ...plano, mensagemAbertura: e.target.value })}
          placeholder={`Ex.: Olá! Montei este plano pensando especificamente na ${crianca.nome}...`}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 13,
            minHeight: 80, fontFamily: "inherit", lineHeight: 1.45 }} />
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
          Aparece no topo do plano, assinada por você. É o que faz a família sentir que o plano foi pensado à mão.
        </div>
      </Bloco>

      <button onClick={onAprovar} disabled={salvando}
        style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", background: CORAL,
          color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: salvando ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: salvando ? .6 : 1 }}>
        <Check size={17} /> {salvando ? "Liberando..." : "Aprovar e liberar para a família"}
      </button>
    </div>
  );
}

function CampoPequeno({ placeholder, value, onChange }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: 9, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12.5,
        marginBottom: 8, fontFamily: "inherit" }} />
  );
}

function Bloco({ titulo, children }) {
  return (
    <div style={{ background: CARD, borderRadius: 16, padding: 18, boxShadow: "0 2px 10px rgba(0,0,0,.05)", marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, textTransform: "uppercase",
        letterSpacing: .6, marginBottom: 12 }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}
