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
      <div style={{ display: "flex", gap: 6 }}>
        {NIVEIS_HABILIDADE.map((n) => {
          const ativo = valor === n.v;
          return (
            <button key={n.v} type="button" onClick={() => onChange(ativo ? undefined : n.v)}
              style={{ flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", lineHeight: 1.3,
                border: ativo ? "none" : `1px solid ${LINE}`,
                background: ativo ? n.cor : "#fff",
                color: ativo ? "#fff" : MUTED }}>
              {n.curto}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== Etapas =====
const ETAPAS = [
  { id: 1, titulo: "Sobre a criança", intro: "Vamos começar pelo básico." },
  { id: 2, titulo: "O que trouxe vocês até aqui", intro: "Quanto mais detalhes, mais personalizado fica o plano." },
  { id: 3, titulo: "A rotina do dia a dia", intro: "Isso ajuda a encaixar as atividades no melhor momento." },
  { id: 4, titulo: "Como seu filho aprende", intro: "Cada criança tem um jeito próprio de aprender." },
  { id: 5, titulo: "As habilidades hoje", intro: "Não existe resposta certa — é o olhar de vocês que importa." },
  { id: 6, titulo: "A rotina de vocês", intro: "Para o plano caber de verdade na vida da família." },
];

export default function TriagemForm({ valor, onChange, onEnviar, enviando }) {
  const [passo, setPasso] = useState(1);
  const t = valor;
  const set = (campo) => (v) => onChange({ ...t, [campo]: v });
  const setHab = (nome, v) => onChange({ ...t, habilidades: { ...t.habilidades, [nome]: v } });

  const etapa = ETAPAS[passo - 1];
  const total = ETAPAS.length;
  const podeEnviar = t.nome.trim() && t.preocupacaoPrincipal.trim();

  function avancar() {
    setPasso(passo + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function voltar() {
    setPasso(passo - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ background: CREAM, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 18px 40px" }}>

        {/* Progresso */}
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {ETAPAS.map((e) => (
            <div key={e.id} style={{ flex: 1, height: 4, borderRadius: 2,
              background: e.id <= passo ? GREEN : "#E8E1D2", transition: "background .25s" }} />
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 26, letterSpacing: .3 }}>
          Etapa {passo} de {total}
        </div>

        {/* Cabeçalho da etapa */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: GREEN, lineHeight: 1.25 }}>{etapa.titulo}</div>
          <div style={{ fontSize: 13.5, color: MUTED, marginTop: 6, fontStyle: "italic" }}>{etapa.intro}</div>
        </div>

        <div style={{ background: CARD, borderRadius: 18, padding: "22px 20px",
          boxShadow: "0 2px 14px rgba(0,0,0,.05)", marginBottom: 18 }}>

          {passo === 1 && (
            <>
              <Linha><Campo largura={2} label="Nome da criança" value={t.nome} onChange={set("nome")} /></Linha>
              <Linha>
                <Campo label="Nascimento" type="date" value={t.dataNascimento} onChange={set("dataNascimento")} />
                <Campo label="Idade" value={t.idade} onChange={set("idade")} placeholder="anos" />
              </Linha>
              <Linha>
                <Campo label="Série" value={t.serie} onChange={set("serie")} />
                <Campo largura={2} label="Escola" value={t.escola} onChange={set("escola")} />
              </Linha>
              <Linha><Campo largura={2} label="Responsáveis" value={t.responsaveis} onChange={set("responsaveis")} /></Linha>
              <Linha>
                <Campo label="Cidade" value={t.cidade} onChange={set("cidade")} />
                <Campo label="Telefone" value={t.telefone} onChange={set("telefone")} placeholder="(00) 00000-0000" />
              </Linha>
              <Linha><Campo largura={2} label="E-mail" type="email" value={t.email} onChange={set("email")} /></Linha>
              <Linha><Campo largura={2} label="Endereço" value={t.endereco} onChange={set("endereco")} /></Linha>

              <div style={{ height: 1, background: "#F2EDE2", margin: "8px 0 22px" }} />

              <Pergunta texto="Tem irmãos?">
                <Opcoes options={["Não", "Sim"]} value={t.temIrmaos} onChange={set("temIrmaos")} />
                {t.temIrmaos === "Sim" && (
                  <Complemento>
                    <Linha gap={10}>
                      <Campo label="Quantos" value={t.qtdIrmaos} onChange={set("qtdIrmaos")} />
                      <Campo label="Idades" value={t.idadesIrmaos} onChange={set("idadesIrmaos")} placeholder="ex: 7 e 14" />
                    </Linha>
                  </Complemento>
                )}
              </Pergunta>

              <Pergunta texto="Com quem mora?">
                <Campo largura={2} label="" value={t.comQuemMora} onChange={set("comQuemMora")}
                  placeholder="ex: pai, mãe e irmão" />
              </Pergunta>

              <Pergunta texto="Faz alguma atividade fora da escola?">
                <Opcoes options={["Não", "Sim"]} value={t.extracurricular} onChange={set("extracurricular")} />
                {t.extracurricular === "Sim" && (
                  <Complemento>
                <Campo largura={2} label="Qual(is)" value={t.qualExtracurricular} onChange={set("qualExtracurricular")}
                  placeholder="ex: vôlei, inglês" />
                <Campo largura={2} label="Quantos dias por semana" value={t.diasExtracurricularSemana} onChange={set("diasExtracurricularSemana")}
                  placeholder="ex: 2" />
              </Complemento>
                )}
              </Pergunta>

              <Pergunta texto="Tem facilidade de fazer amigos ou prefere ficar sozinho?">
                <Opcoes options={["Tem facilidade", "Prefere ficar sozinho", "Depende do contexto"]}
                  value={t.sociabilidade} onChange={set("sociabilidade")} />
              </Pergunta>
            </>
          )}

          {passo === 2 && (
            <>
              <Pergunta numero="1" texto="Qual é a principal preocupação da família hoje?">
                <TextoLongo value={t.preocupacaoPrincipal} onChange={set("preocupacaoPrincipal")}
                  placeholder="Conte com suas palavras o que vocês têm percebido." />
              </Pergunta>

              <Pergunta numero="2" texto="Há quanto tempo essa dificuldade é percebida?">
                <Opcoes options={["Menos de 6 meses", "Entre 6 meses e 1 ano", "Mais de 1 ano"]}
                  value={t.tempoDificuldade} onChange={set("tempoDificuldade")} />
              </Pergunta>

              <Pergunta numero="3" texto="A criança possui algum diagnóstico ou acompanhamento de saúde?">
                <Opcoes options={["Não", "Sim", "Em investigação"]}
                  value={t.temDiagnostico} onChange={set("temDiagnostico")} />
                {(t.temDiagnostico === "Sim" || t.temDiagnostico === "Em investigação") && (
                  <Complemento>
                <Campo largura={2} label="Qual(is)" value={t.qualDiagnostico} onChange={set("qualDiagnostico")} />
                  <div style={{ marginTop: 8, fontSize: 13, color: "#4C6144", background: "#FCF7F0", padding: 10, borderRadius: 8 }}>
                    📄 Se já tiver o laudo em mãos, envie uma foto ou PDF direto pelo WhatsApp:{" "}
                    <a href="https://wa.me/5514991528623" target="_blank" rel="noopener noreferrer" style={{ color: "#E78A6B", fontWeight: "bold" }}>
                      clique aqui para enviar
                    </a>
                  </div>
                </Complemento>
              )}
            </Pergunta>   

              <Pergunta numero="4" texto="Faz uso de alguma medicação?">
                <Opcoes options={["Não", "Sim"]} value={t.usaMedicacao} onChange={set("usaMedicacao")} />
                {t.usaMedicacao === "Sim" && (
                  <Complemento>
                    <Linha gap={10}>
                      <Campo largura={2} label="Qual" value={t.qualMedicacao} onChange={set("qualMedicacao")} />
                      <Campo label="Dosagem" value={t.dosagem} onChange={set("dosagem")} placeholder="opcional" />
                    </Linha>
                  </Complemento>
                )}
              </Pergunta>

              <Pergunta numero="5" texto="É acompanhada por algum profissional?"
                ajuda="Pode marcar mais de uma opção.">
                <Opcoes multipla
                  options={["Psicólogo", "Fonoaudiólogo", "Terapeuta Ocupacional", "Neuropediatra",
                    "Pediatra", "Psiquiatra", "Psicopedagogo"]}
                  value={t.acompanhamentos} onChange={set("acompanhamentos")} />
                <Complemento>
                  <Campo largura={2} label="Outro" value={t.outroAcompanhamento} onChange={set("outroAcompanhamento")} />
                </Complemento>
              </Pergunta>

              <Pergunta numero="6" texto="O que mais preocupa?" ajuda="Pode marcar mais de uma opção.">
                <Opcoes multipla
                  options={["Leitura", "Escrita", "Matemática", "Atenção", "Memória",
                    "Organização", "Comportamento", "Linguagem"]}
                  value={t.oQueMaisPreocupa} onChange={set("oQueMaisPreocupa")} />
                <Complemento>
                  <Campo largura={2} label="Outro" value={t.outraPreocupacao} onChange={set("outraPreocupacao")} />
                </Complemento>
              </Pergunta>
            </>
          )}

          {passo === 3 && (
            <>
              <Pergunta numero="1" texto="Seu filho dorme aproximadamente:">
                <Opcoes options={["Menos de 8h", "8 a 10h", "Mais de 10h"]} value={t.sono} onChange={set("sono")} />
              </Pergunta>
              <Pergunta numero="2" texto="Tempo de tela por dia:">
                <Opcoes options={["Menos de 1h", "1 a 2h", "2 a 4h", "Mais de 4h"]}
                  value={t.tempoTela} onChange={set("tempoTela")} />
              </Pergunta>
              <Pergunta numero="3" texto="Realiza tarefas sozinho?">
                <Opcoes options={["Sempre", "Às vezes", "Nunca"]}
                  value={t.tarefasSozinho} onChange={set("tarefasSozinho")} />
              </Pergunta>
              <Pergunta numero="4" texto="Costuma brincar?">
                <Opcoes options={["Sim", "Pouco", "Quase nunca"]} value={t.brincar} onChange={set("brincar")} />
              </Pergunta>
              <Pergunta numero="5" texto="Pratica atividade física?">
                <Opcoes options={["Sim", "Não"]} value={t.atividadeFisica} onChange={set("atividadeFisica")} />
              </Pergunta>
            </>
          )}

          {passo === 4 && (
            <>
              <Pergunta numero="1" texto="Quando precisa aprender algo novo, seu filho geralmente:"
                ajuda="Pode marcar mais de uma opção.">
                <Opcoes multipla
                  options={["Aprende observando", "Aprende ouvindo", "Aprende fazendo", "Precisa repetir várias vezes"]}
                  value={t.comoAprende} onChange={set("comoAprende")} />
              </Pergunta>
              <Pergunta numero="2" texto="Ele costuma:" ajuda="Pode marcar mais de uma opção.">
                <Opcoes multipla
                  options={["Desistir facilmente", "Persistir", "Pedir ajuda", "Ficar frustrado", "Gostar de desafios"]}
                  value={t.comoCostuma} onChange={set("comoCostuma")} />
              </Pergunta>
              <Pergunta numero="3" texto="Como reage aos erros?" ajuda="Pode marcar mais de uma opção.">
                <Opcoes multipla options={["Fica bravo", "Chora", "Tenta novamente", "Não liga"]}
                  value={t.reacaoErro} onChange={set("reacaoErro")} />
              </Pergunta>
              <Pergunta numero="4" texto="Consegue permanecer concentrado por quanto tempo?">
                <Opcoes options={["Até 5 minutos", "10 minutos", "15 minutos", "Mais de 20 minutos"]}
                  value={t.tempoConcentracao} onChange={set("tempoConcentracao")} />
              </Pergunta>
            </>
          )}

          {passo === 5 && (
            <>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
                Marque uma opção em cada linha, pensando em como seu filho está hoje.
              </div>
              {HABILIDADES_TRIAGEM.map((h) => (
                <LinhaHabilidade key={h} nome={h} valor={t.habilidades[h]} onChange={(v) => setHab(h, v)} />
              ))}
            </>
          )}

          {passo === 6 && (
            <>
              <Pergunta numero="1" texto="Quem será o principal responsável por realizar as atividades com a criança?">
                <Opcoes options={["Mãe", "Pai", "Ambos", "Avós"]}
                  value={t.responsavelAtividades} onChange={set("responsavelAtividades")} />
                <Complemento>
                  <Campo largura={2} label="Outro" value={t.outroResponsavel} onChange={set("outroResponsavel")} />
                </Complemento>
              </Pergunta>

              <Pergunta numero="2" texto="Qual é o melhor período do dia para realizar as atividades?">
                <Opcoes options={["Manhã", "Tarde", "Noite", "Varia conforme a rotina"]}
                  value={t.melhorPeriodo} onChange={set("melhorPeriodo")} />
              </Pergunta>

              <Pergunta numero="3" texto="Vocês conseguem reservar 20 minutos por dia, em 4 dias da semana?">
                <Opcoes options={["Sim", "Precisaremos ajustar nossa rotina"]}
                  value={t.consegue20min} onChange={set("consegue20min")} />
              </Pergunta>

              <Pergunta numero="4" texto="Como preferem receber os materiais?">
                <Opcoes options={["E-mail", "WhatsApp", "Ambos"]}
                  value={t.comoReceberMateriais} onChange={set("comoReceberMateriais")} />
              </Pergunta>

              <Pergunta numero="5" texto="Qual é a melhor forma de receber as orientações?">
                <Opcoes options={["Texto", "Áudio", "Texto e áudio"]}
                  value={t.formatoMateriais} onChange={set("formatoMateriais")} />
              </Pergunta>

              <Pergunta numero="6" texto="O que pode dificultar a realização das atividades na sua rotina?"
                ajuda="Pode marcar mais de uma opção.">
                <Opcoes multipla
                  options={["Falta de tempo", "Cansaço da criança", "Cansaço dos responsáveis",
                    "Dificuldade em manter uma rotina", "Resistência da criança"]}
                  value={t.dificuldades} onChange={set("dificuldades")} />
                <Complemento>
                  <Campo largura={2} label="Outro" value={t.outraDificuldade} onChange={set("outraDificuldade")} />
                </Complemento>
              </Pergunta>

              <Pergunta numero="7"
                texto="Existe alguma informação sobre a rotina da família que a Michelle deva conhecer para personalizar melhor as atividades?">
                <TextoLongo value={t.infoAdicional} onChange={set("infoAdicional")}
                  placeholder="Fique à vontade para contar o que achar importante." />
              </Pergunta>
            </>
          )}
        </div>

        {/* Navegação */}
        <div style={{ display: "flex", gap: 10 }}>
          {passo > 1 && (
            <button type="button" onClick={voltar}
              style={{ flex: 1, padding: "14px 20px", borderRadius: 13, border: `1.5px solid ${GREEN}`,
                background: "transparent", color: GREEN, fontWeight: 700, fontSize: 14.5,
                cursor: "pointer", fontFamily: "inherit" }}>
              Voltar
            </button>
          )}
          {passo < total ? (
            <button type="button" onClick={avancar}
              style={{ flex: 2, padding: "14px 20px", borderRadius: 13, border: "none", background: GREEN,
                color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit" }}>
              Continuar
            </button>
          ) : (
            <button type="button" onClick={onEnviar} disabled={!podeEnviar || enviando}
              style={{ flex: 2, padding: "14px 20px", borderRadius: 13, border: "none", background: CORAL,
                color: "#fff", fontWeight: 700, fontSize: 14.5, fontFamily: "inherit",
                cursor: podeEnviar && !enviando ? "pointer" : "not-allowed",
                opacity: podeEnviar && !enviando ? 1 : .45 }}>
              {enviando ? "Enviando..." : "Enviar para a Michelle"}
            </button>
          )}
        </div>

        {passo === total && (
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 14, textAlign: "center", lineHeight: 1.55 }}>
            A Michelle vai ler cada resposta, montar o plano da {t.nome || "criança"} e liberar para vocês.
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 30, fontSize: 12, color: SAGE, fontStyle: "italic" }}>
          Cada criança tem um jeito único de aprender.
        </div>
      </div>
    </div>
  );
}
