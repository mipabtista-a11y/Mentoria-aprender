import React, { useState, useEffect } from "react";
import { Bell, BellOff, Check, Send, Clock } from "lucide-react";

const GREEN = "#4C6144";
const SAGE = "#829473";
const CORAL = "#E78A6B";
const CARD = "#FFFFFF";
const INK = "#3A3530";
const MUTED = "#8A8378";
const LINE = "#E3DBC9";

/**
 * Painel de lembretes.
 * A Michelle escreve as mensagens, vê quem está sem registro
 * e pode pausar os lembretes de uma família específica.
 */
export default function PainelLembretes({ supabase }) {
  const [modelos, setModelos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [salvando, setSalvando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const [{ data: m }, { data: f }] = await Promise.all([
      supabase.from("modelos_lembrete").select("*").order("chave"),
      supabase.from("engajamento_semanal").select("*").order("registros_na_semana"),
    ]);
    setModelos(m || []);
    setFamilias(f || []);
    setCarregando(false);
  }

  function editarModelo(chave, campo, valor) {
    setModelos(modelos.map((m) => (m.chave === chave ? { ...m, [campo]: valor } : m)));
  }

  async function salvarModelo(modelo) {
    setSalvando(modelo.chave);
    await supabase.from("modelos_lembrete")
      .update({ assunto: modelo.assunto, corpo: modelo.corpo, ativo: modelo.ativo })
      .eq("chave", modelo.chave);
    setSalvando(null);
  }

  async function alternarPausa(crianca) {
    const novo = !crianca.lembretes_pausados;
    await supabase.from("criancas").update({ lembretes_pausados: novo }).eq("id", crianca.crianca_id);
    setFamilias(familias.map((f) =>
      f.crianca_id === crianca.crianca_id ? { ...f, lembretes_pausados: novo } : f
    ));
  }

  if (carregando) {
    return <div style={{ padding: 40, textAlign: "center", color: MUTED }}>Carregando…</div>;
  }

  const semRegistro = familias.filter((f) => f.registros_na_semana === 0 && !f.lembretes_pausados);
  const pausadas = familias.filter((f) => f.lembretes_pausados);

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 700, color: GREEN, marginBottom: 4 }}>Lembretes</div>
      <div style={{ fontSize: 13, color: MUTED, marginBottom: 22, lineHeight: 1.5 }}>
        Enviados na quinta e na sexta à noite, apenas para quem não registrou nada na semana.
      </div>

      {/* Quem está sem registro agora */}
      <Bloco titulo={`Sem registro nesta semana — ${semRegistro.length}`}>
        {semRegistro.length === 0 ? (
          <div style={{ fontSize: 13, color: SAGE, display: "flex", gap: 7, alignItems: "center" }}>
            <Check size={15} /> Todas as famílias registraram esta semana.
          </div>
        ) : (
          semRegistro.map((f) => (
            <LinhaFamilia key={f.crianca_id} familia={f} onPausar={() => alternarPausa(f)} />
          ))
        )}
      </Bloco>

      {pausadas.length > 0 && (
        <Bloco titulo={`Lembretes pausados — ${pausadas.length}`}>
          {pausadas.map((f) => (
            <LinhaFamilia key={f.crianca_id} familia={f} pausada onPausar={() => alternarPausa(f)} />
          ))}
        </Bloco>
      )}

      {/* Modelos de mensagem */}
      {modelos.map((m) => (
        <Bloco key={m.chave} titulo={m.chave === "quinta" ? "Mensagem de quinta-feira" : "Mensagem de sexta-feira"}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <button onClick={() => editarModelo(m.chave, "ativo", !m.ativo)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 20,
                border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
                background: m.ativo ? "#EAF0E4" : "#F2EFE9", color: m.ativo ? GREEN : MUTED }}>
              {m.ativo ? <Bell size={14} /> : <BellOff size={14} />}
              {m.ativo ? "Ativa" : "Desativada"}
            </button>
          </div>

          <Rotulo>Assunto</Rotulo>
          <input value={m.assunto} onChange={(e) => editarModelo(m.chave, "assunto", e.target.value)}
            style={{ width: "100%", padding: 11, borderRadius: 11, border: `1px solid ${LINE}`,
              fontSize: 13.5, fontFamily: "inherit", marginBottom: 14 }} />

          <Rotulo>Mensagem</Rotulo>
          <textarea value={m.corpo} onChange={(e) => editarModelo(m.chave, "corpo", e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 11, border: `1px solid ${LINE}`,
              fontSize: 13.5, minHeight: 190, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical" }} />

          <div style={{ fontSize: 11.5, color: MUTED, margin: "9px 0 14px", lineHeight: 1.5 }}>
            Use <code style={{ background: "#F2EFE9", padding: "1px 5px", borderRadius: 4 }}>{"{crianca}"}</code> para
            o nome da criança e <code style={{ background: "#F2EFE9", padding: "1px 5px", borderRadius: 4 }}>{"{responsavel}"}</code> para
            o primeiro nome de quem responde. Os nomes entram automaticamente no envio.
          </div>

          <Previa modelo={m} />

          <button onClick={() => salvarModelo(m)} disabled={salvando === m.chave}
            style={{ width: "100%", marginTop: 14, padding: "12px 20px", borderRadius: 12, border: "none",
              background: GREEN, color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
              cursor: "pointer", opacity: salvando === m.chave ? .6 : 1 }}>
            {salvando === m.chave ? "Salvando…" : "Salvar mensagem"}
          </button>
        </Bloco>
      ))}
    </div>
  );
}

function LinhaFamilia({ familia, pausada, onPausar }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0", borderBottom: `1px solid #F2EDE2` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{familia.crianca}</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2, display: "flex", gap: 5, alignItems: "center" }}>
          <Clock size={11} />
          {familia.ultimo_registro
            ? `último registro em ${formatarData(familia.ultimo_registro)}`
            : "nenhum registro até agora"}
        </div>
      </div>
      <button onClick={onPausar} title={pausada ? "Voltar a enviar" : "Pausar lembretes"}
        style={{ background: pausada ? "#EAF0E4" : "#F7EFE9", border: "none", borderRadius: 9,
          padding: "8px 12px", cursor: "pointer", fontSize: 11.5, fontWeight: 700, fontFamily: "inherit",
          color: pausada ? GREEN : CORAL, flexShrink: 0, display: "flex", gap: 6, alignItems: "center" }}>
        {pausada ? <><Bell size={12} /> Retomar</> : <><BellOff size={12} /> Pausar</>}
      </button>
    </div>
  );
}

function Previa({ modelo }) {
  const exemplo = { crianca: "Juliana", responsavel: "Marina" };
  const preencher = (t) => t.replace(/\{(\w+)\}/g, (_, c) => exemplo[c] ?? `{${c}}`);

  return (
    <div style={{ background: "#F9F7F2", borderRadius: 12, padding: "14px 16px", border: `1px solid ${LINE}` }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: "uppercase",
        letterSpacing: .5, marginBottom: 9, display: "flex", gap: 6, alignItems: "center" }}>
        <Send size={11} /> Como a família recebe
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 8 }}>
        {preencher(modelo.assunto)}
      </div>
      <div style={{ fontSize: 13, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {preencher(modelo.corpo)}
      </div>
    </div>
  );
}

function Bloco({ titulo, children }) {
  return (
    <div style={{ background: CARD, borderRadius: 16, padding: 18, marginBottom: 14,
      boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, textTransform: "uppercase",
        letterSpacing: .6, marginBottom: 13 }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function Rotulo({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase",
      letterSpacing: .4, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function formatarData(iso) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}
