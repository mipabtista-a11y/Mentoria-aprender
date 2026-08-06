import React, { useState } from "react";
import { Check } from "lucide-react";

const GREEN = "#4C6144";
const SAGE = "#829473";
const CORAL = "#E78A6B";
const CREAM = "#FCF7F0";
const CARD = "#FFFFFF";
const INK = "#3A3530";
const MUTED = "#8A8378";
const LINE = "#E3DBC9";

// ===== Estrutura das respostas =====
export const TRIAGEM_VAZIA = {
  nome: "", dataNascimento: "", idade: "", serie: "", escola: "",
  responsaveis: "", cidade: "", telefone: "", email: "", endereco: "",
  temIrmaos: "", qtdIrmaos: "", idadesIrmaos: "", comQuemMora: "",
  extracurricular: "", qualExtracurricular: "", sociabilidade: "",

  preocupacaoPrincipal: "", tempoDificuldade: "",
  temDiagnostico: "", qualDiagnostico: "",
  usaMedicacao: "", qualMedicacao: "", dosagem: "",
  acompanhamentos: [], outroAcompanhamento: "",
  oQueMaisPreocupa: [], outraPreocupacao: "",

  sono: "", tempoTela: "", tarefasSozinho: "", brincar: "", atividadeFisica: "",

  comoAprende: [], comoCostuma: [], reacaoErro: [], tempoConcentracao: "",

  responsavelAtividades: "", outroResponsavel: "", melhorPeriodo: "",
  consegue20min: "", comoReceberMateriais: "", formatoMateriais: "",
  dificuldades: [], outraDificuldade: "", infoAdicional: "",

  habilidades: {},
};

export const HABILIDADES_TRIAGEM = [
  "Atenção", "Memória", "Linguagem", "Organização", "Coordenação motora",
  "Leitura", "Escrita", "Matemática", "Autonomia", "Controle emocional",
];

export const NIVEIS_HABILIDADE = [
  { v: 2, label: "Precisa de muito estímulo", curto: "Muito estímulo", cor: "#E05A3C" },
  { v: 1, label: "Em desenvolvimento", curto: "Em desenvolvimento", cor: "#E8A93C" },
  { v: 0, label: "Bem desenvolvida", curto: "Bem desenvolvida", cor: GREEN },
];

// ===== Átomos =====
function Campo({ label, value, onChange, placeholder, largura = 1, type = "text" }) {
  return (
    <div style={{ flex: largura, minWidth: largura > 1 ? 200 : 110 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: MUTED, marginBottom: 5,
        textTransform: "uppercase", letterSpacing: .4 }}>
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 12px", borderRadius: 11, border: `1px solid ${LINE}`,
          fontSize: 14, fontFamily: "inherit", background: "#fff", color: INK, outlineColor: SAGE }} />
    </div>
  );
}

function Linha({ children, gap = 10 }) {
  return <div style={{ display: "flex", gap, flexWrap: "wrap", marginBottom: 14 }}>{children}</div>;
}

function Pergunta({ numero, texto, ajuda, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", gap: 9, marginBottom: 9 }}>
        {numero && (
          <span style={{ fontSize: 13, fontWeight: 700, color: SAGE, flexShrink: 0, lineHeight: 1.45 }}>
            {numero}.
          </span>
        )}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.45 }}>{texto}</div>
          {ajuda && <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{ajuda}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Opcoes({ options, value, onChange, multipla }) {
  const lista = multipla ? value : [value];
  function alternar(o) {
    if (multipla) {
      onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
    } else {
      onChange(value === o ? "" : o);
    }
  }
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => {
        const ativo = lista.includes(o);
        return (
          <button key={o} type="button" onClick={() => alternar(o)}
            style={{ padding: "10px 15px", borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all .12s",
              border: ativo ? "none" : `1px solid ${LINE}`,
              background: ativo ? (multipla ? CORAL : GREEN) : "#fff",
              color: ativo ? "#fff" : INK,
              display: "flex", alignItems: "center", gap: 6 }}>
            {ativo && <Check size={13} strokeWidth={3} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

function TextoLongo({ value, onChange, placeholder }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "12px", borderRadius: 11, border: `1px solid ${LINE}`,
        fontSize: 14, minHeight: 88, fontFamily: "inherit", lineHeight: 1.5, background: "#fff",
        color: INK, outlineColor: SAGE, resize: "vertical" }} />
  );
}

function Complemento({ children }) {
  return (
    <div style={{ marginTop: 11, paddingLeft: 13, borderLeft: `2px solid ${LINE}` }}>
      {children}
    </div>
  );
}

function LinhaHabilidade({ nome, valor, onChange }) {
  return (
    <div style={{ padding: "13px 0", borderBottom: `1px solid #F2EDE2` }}>
      <div style={{ fontSize: 13.5, color: INK, fontWeight: 600, marginBottom: 8 }}>{nome}</div>
      
