import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Heart, LogOut, ChevronLeft, ChevronRight, Plus, Bell, Send,
  Check, Clock, MessageSquare, ClipboardList, Users, AlertCircle, Printer, Sparkles,
} from "lucide-react";

import TriagemForm, { TRIAGEM_VAZIA } from "./TriagemForm.jsx";
import RevisaoPlano from "./RevisaoPlano";
import PainelLembretes from "./PainelLembretes.jsx";
import FolhaAtividade from "./FolhaAtividade";
import { gerarPlano, gerarPlanoComHistorico } from "./gerarPlano.js";
import { BIBLIOTECA } from "./biblioteca.js";
import { materialProntoDe } from "./materiaisProntos.js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
);

const GREEN = "#4C6144";
const SAGE = "#829473";
const CORAL = "#E78A6B";
const CREAM = "#FCF7F0";
const CARD = "#FFFFFF";
const INK = "#3A3530";
const MUTED = "#8A8378";
const LINE = "#E3DBC9";

/** Formata como AAAA-MM-DD usando o horário local do aparelho, não UTC —
 * evita que a data "vire o dia seguinte" cedo demais perto da meia-noite. */
function dataLocal(d = new Date()) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const hoje = () => dataLocal();

function inicioDaSemana() {
  const d = new Date();
  const dia = d.getDay();
  d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
  return dataLocal(d);
}

// ===== Peças visuais =====
function Card({ children, style, onClick }: { children?: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background: CARD, borderRadius: 16, padding: 18,
      boxShadow: "0 2px 10px rgba(0,0,0,.05)", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}
function PainelGamificacao({ pontos, selos, sequencia }: { pontos?: number; selos?: number; sequencia?: number }) {
  return (
    <Card style={{ display: "flex", justifyContent: "space-around", padding: 16, marginBottom: 16 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{pontos ?? 0}</div>
        <div style={{ fontSize: 12, color: MUTED }}>Pontos</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: CORAL }}>{selos ?? 0}</div>
        <div style={{ fontSize: 12, color: MUTED }}>Selos</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{sequencia ?? 0}🔥</div>
        <div style={{ fontSize: 12, color: MUTED }}>Sequência</div>
      </div>
    </Card>
  );
}

function Botao({ children, onClick, variante = "primario", largo, icone: Icone, ocupado, desabilitado }: { children?: React.ReactNode; onClick?: () => void; variante?: "primario" | "coral" | "contorno"; largo?: boolean; icone?: React.ComponentType<{ size?: number }>; ocupado?: boolean; desabilitado?: boolean }) {
  const estilos = {
    primario: { background: GREEN, color: "#fff", border: "none" },
    coral: { background: CORAL, color: "#fff", border: "none" },
    contorno: { background: "transparent", color: GREEN, border: `1.5px solid ${GREEN}` },
  };
  const inativo = ocupado || desabilitado;
  return (
    <button onClick={onClick} disabled={inativo}
      style={{ ...estilos[variante], borderRadius: 12, padding: "13px 20px", fontWeight: 700,
        fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        cursor: inativo ? "default" : "pointer", width: largo ? "100%" : "auto",
        opacity: inativo ? .5 : 1, fontFamily: "inherit" }}>
      {Icone && !ocupado && <Icone size={16} />}
      {ocupado ? "Aguarde…" : children}
    </button>
  );
}

function Cabecalho({ titulo, subtitulo, aoVoltar, acao }: { titulo: string; subtitulo?: string; aoVoltar?: () => void; acao?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
      {aoVoltar && (
        <button onClick={aoVoltar} style={{ background: "#EFE9DA", border: "none", borderRadius: 10,
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0 }}>
          <ChevronLeft size={18} color={GREEN} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: GREEN, lineHeight: 1.3 }}>{titulo}</div>
        {subtitulo && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>{subtitulo}</div>}
      </div>
      {acao}
    </div>
  );
}

function Aba({ ativa, onClick, children }: { ativa: boolean; onClick?: () => void; children?: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ flex: 1, padding: "11px 8px", border: "none", borderRadius: 11, fontSize: 13,
        fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        background: ativa ? GREEN : "transparent", color: ativa ? "#fff" : MUTED }}>
      {children}
    </button>
  );
}

function Vazio({ titulo, texto, children }: { titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <Card style={{ textAlign: "center", padding: 32 }}>
      <div style={{ fontWeight: 700, color: GREEN, marginBottom: 6, fontSize: 15 }}>{titulo}</div>
      <div style={{ fontSize: 13, color: MUTED, marginBottom: children ? 18 : 0, lineHeight: 1.5 }}>{texto}</div>
      {children}
    </Card>
  );
}

// ===== Entrada =====
function Entrada({ aoEntrar }) {
  const [modo, setModo] = useState("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar() {
    setOcupado(true); setErro("");
    try {
      const fn = modo === "entrar" ? "signInWithPassword" : "signUp";
      const { data, error } = await supabase.auth[fn]({ email, password: senha });
      if (error) throw error;
      if (data.user) aoEntrar(data.user);
      else setErro("Confirme seu e-mail para continuar.");
    } catch (e) {
      setErro(traduzirErro(e.message));
    } finally {
      setOcupado(false);
    }
  }
  async function recuperarSenha() {
      if (!email) { setErro("Digite seu e-mail no campo acima primeiro."); return; }
      setOcupado(true); setErro("");
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setErro("Enviamos um e-mail com o link para redefinir sua senha.");
      } catch (e) {
        setErro(traduzirErro(e.message));
      } finally {
        setOcupado(false);
      }
    }

  return (
    <div style={{ maxWidth: 380, margin: "50px auto", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#F1EAD9",
        margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Heart size={26} color={CORAL} />
      </div>
      <div style={{ fontSize: 23, fontWeight: 700, color: GREEN, letterSpacing: 1.5 }}>
        A.P.R.E.N.D.E.R.
      </div>
      <div style={{ fontSize: 13, color: MUTED, fontStyle: "italic", margin: "8px 0 26px" }}>
        Transformando pais em mediadores da aprendizagem.
      </div>

      <Card>
        <input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 11, border: `1px solid ${LINE}`,
            fontSize: 14, marginBottom: 10, fontFamily: "inherit" }} />
        <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          style={{ width: "100%", padding: 12, borderRadius: 11, border: `1px solid ${LINE}`,
            fontSize: 14, marginBottom: 14, fontFamily: "inherit" }} />
        {erro && <div style={{ color: CORAL, fontSize: 12.5, marginBottom: 12, textAlign: "left" }}>{erro}</div>}
        <Botao largo onClick={enviar} ocupado={ocupado}>
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </Botao>
        <button onClick={() => { setModo(modo === "entrar" ? "criar" : "entrar"); setErro(""); }}
          style={{ background: "none", border: "none", color: SAGE, fontSize: 12.5, marginTop: 14,
            cursor: "pointer", fontFamily: "inherit" }}>
          {modo === "entrar" ? "Ainda não tenho conta" : "Já tenho conta"}
        </button>
        {modo === "entrar" && (
            <button onClick={recuperarSenha} style={{ background: "none", border: "none", color: SAGE, fontSize: 12.5, marginTop: 10, cursor: "pointer", fontFamily: "inherit", display: "block", margin: "10px auto 0" }}>
              Esqueci minha senha
            </button>
          )}
      </Card>
    </div>
  );
}

function traduzirErro(msg = "") {
  if (msg.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered")) return "Este e-mail já tem conta. Tente entrar.";
  if (msg.includes("Password should be")) return "A senha precisa de pelo menos 6 caracteres.";
  return "Não foi possível continuar. Tente novamente.";
}

function TelaAssinatura({ usuario, aoAssinar, indo, aoAtualizar, aoSair }) {
  const [conferindo, setConferindo] = useState(false);
  const voltouDoPagamento = new URLSearchParams(window.location.search).get("assinatura");

  async function conferirDeNovo() {
    setConferindo(true);
    await aoAtualizar();
    setConferindo(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1EAD9",
        margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Heart size={28} color={CORAL} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: GREEN, letterSpacing: 1 }}>MENTORIA A.P.R.E.N.D.E.R.</div>
      <div style={{ fontSize: 14, color: MUTED, fontStyle: "italic", margin: "10px 0 26px" }}>
        Transformando pais em mediadores da aprendizagem.
      </div>

      {voltouDoPagamento === "sucesso" && (
        <Card style={{ marginBottom: 16, borderLeft: `4px solid ${GREEN}`, background: "#FAFBF8" }}>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.55 }}>
            Se você acabou de pagar, pode levar alguns segundos até liberar aqui. Toca em "Já paguei, atualizar".
          </div>
        </Card>
      )}

      <Card style={{ textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: CORAL, textTransform: "uppercase",
          letterSpacing: .5, marginBottom: 6 }}>
          Assinatura mensal
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: GREEN, marginBottom: 14 }}>
          R$ 149,90<span style={{ fontSize: 14, fontWeight: 400, color: MUTED }}> /mês</span>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Triagem completa, lida pessoalmente pela Michelle",
            "Plano personalizado, revisado e aprovado por ela",
            "Atividades prontas para aplicar ou imprimir",
            "Feedback semanal escrito por ela",
            "Conversa direta pelo app quando surgir dúvida",
          ].map((t) => (
            <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: INK }}>
              <Check size={16} color={SAGE} style={{ marginTop: 2, flexShrink: 0 }} /> {t}
            </li>
          ))}
        </ul>
        <Botao largo variante="coral" icone={Sparkles} onClick={aoAssinar} ocupado={indo}>
          Assinar e começar
        </Botao>
        <div style={{ marginTop: 10 }}>
          <Botao largo variante="contorno" onClick={conferirDeNovo} ocupado={conferindo}>
            Já paguei, atualizar
          </Botao>
        </div>
        <div style={{ fontSize: 10.5, color: MUTED, marginTop: 12, lineHeight: 1.5, textAlign: "center" }}>
          Cancele quando quiser. Sem fidelidade.
        </div>
      </Card>

      <button onClick={aoSair} style={{ background: "none", border: "none", color: MUTED, fontSize: 12.5,
        marginTop: 18, cursor: "pointer", fontFamily: "inherit" }}>
        Sair de {usuario.email}
      </button>
    </div>
  );
}

// ============================================
// LADO DA FAMÍLIA
// ============================================
function AppFamilia({ usuario, aoSair }) {
  const [criancas, setCriancas] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [tela, setTela] = useState("lista");
  const [atualId, setAtualId] = useState(null);
  const [triagem, setTriagem] = useState(TRIAGEM_VAZIA);
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [assinatura, setAssinatura] = useState(null);
  const [indoParaPagamento, setIndoParaPagamento] = useState(false);

  const carregar = useCallback(async () => {
    const { data: assin } = await supabase.from("assinaturas").select("*").eq("user_id", usuario.id).maybeSingle();
    setAssinatura(assin);

    const { data } = await supabase.from("criancas").select("*").eq("user_id", usuario.id);
    for (const c of data || []) {
      const [{ data: plano }, { data: fb }, { data: regs }, {data:gam}] = await Promise.all([
        supabase.from("planos").select("*").eq("crianca_id", c.id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("feedback_semanal").select("*").eq("crianca_id", c.id)
          .order("semana_inicio", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("registros").select("*").eq("crianca_id", c.id)
          .gte("date", inicioDaSemana()),
        supabase.from("gamificacao_crianca").select("*").eq("crianca_id", c.id).maybeSingle(),
      ]);
      c.plano = plano;
      c.feedback = fb;
      c.registrosSemana = regs || [];
      c.gamificacao = gam || { total_pontos: 0, total_selos: 0, sequencia_atual: 0 };
    }
    setCriancas(data || []);

    const { data: nots } = await supabase.from("notificacoes").select("*")
      .eq("user_id", usuario.id).eq("lida", false).order("created_at", { ascending: false });
    setNotificacoes(nots || []);
    setCarregando(false);
  }, [usuario.id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function assinar() {
    setIndoParaPagamento(true);
    try {
      const { data, error } = await supabase.functions.invoke("criar-checkout");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } finally {
      setIndoParaPagamento(false);
    }
  }

  async function enviarTriagem() {
    setOcupado(true);
    try {
      const { data: crianca } = await supabase.from("criancas")
        .insert({ user_id: usuario.id, nome: triagem.nome, idade: parseInt(triagem.idade) || null })
        .select().single();

      await supabase.from("triagens").insert({
        crianca_id: crianca.id,
        nome: triagem.nome,
        data_nascimento: triagem.dataNascimento || null,
        idade: parseInt(triagem.idade) || null,
        serie: triagem.serie, escola: triagem.escola,
        responsaveis: triagem.responsaveis, cidade: triagem.cidade,
        telefone: triagem.telefone, email: triagem.email, endereco: triagem.endereco,
        tem_irmaos: triagem.temIrmaos, qtd_irmaos: triagem.qtdIrmaos,
        idades_irmaos: triagem.idadesIrmaos, com_quem_mora: triagem.comQuemMora,
        extracurricular: triagem.extracurricular, qual_extracurricular: triagem.qualExtracurricular,
        sociabilidade: triagem.sociabilidade,
        preocupacao_principal: triagem.preocupacaoPrincipal,
        tempo_dificuldade: triagem.tempoDificuldade,
        tem_diagnostico: triagem.temDiagnostico, qual_diagnostico: triagem.qualDiagnostico,
        usa_medicacao: triagem.usaMedicacao, qual_medicacao: triagem.qualMedicacao,
        dosagem: triagem.dosagem, acompanhamentos: triagem.acompanhamentos,
        outro_acompanhamento: triagem.outroAcompanhamento,
        o_que_mais_preocupa: triagem.oQueMaisPreocupa, outra_preocupacao: triagem.outraPreocupacao,
        sono: triagem.sono, tempo_tela: triagem.tempoTela,
        tarefas_sozinho: triagem.tarefasSozinho, brincar: triagem.brincar,
        atividade_fisica: triagem.atividadeFisica,
        como_aprende: triagem.comoAprende, como_costuma: triagem.comoCostuma,
        reacao_erro: triagem.reacaoErro, tempo_concentracao: triagem.tempoConcentracao,
        responsavel_atividades: triagem.responsavelAtividades,
        outro_responsavel: triagem.outroResponsavel, melhor_periodo: triagem.melhorPeriodo,
        consegue_20min: triagem.consegue20min,
        como_receber_materiais: triagem.comoReceberMateriais,
        formato_materiais: triagem.formatoMateriais,
        dificuldades: triagem.dificuldades, outra_dificuldade: triagem.outraDificuldade,
        info_adicional: triagem.infoAdicional,
        habilidades: triagem.habilidades,
      });

      // O rascunho já nasce aqui; a Michelle revisa e aprova antes de liberar.
      const plano = gerarPlano(triagem, BIBLIOTECA);
      await supabase.from("planos").insert({
        crianca_id: crianca.id, dados: plano, status: "pending",
      });

      setTriagem(TRIAGEM_VAZIA);
      setTela("lista");
      await carregar();
    } finally {
      setOcupado(false);
    }
  }

  async function marcarLida(id) {
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    setNotificacoes(notificacoes.filter((n) => n.id !== id));
  }

  if (carregando) return <Carregando />;

  if (assinatura?.status !== "ativa") {
    return <TelaAssinatura usuario={usuario} aoAssinar={assinar} indo={indoParaPagamento} aoAtualizar={carregar} aoSair={aoSair} />;
  }

  if (tela === "triagem") {
    return (
      <TriagemForm valor={triagem} onChange={setTriagem} onEnviar={enviarTriagem} enviando={ocupado} />
    );
  }

  const atual = criancas.find((c) => c.id === atualId);

  if (tela === "crianca" && atual) {
    return <TelaFamiliaCrianca crianca={atual} aoVoltar={() => { setTela("lista"); carregar(); }}
      usuario={usuario} aoRegistrar={carregar} />;
  }

  return (
    <div>
      <Cabecalho titulo="Mentoria A.P.R.E.N.D.E.R."
        subtitulo={usuario.email}
        acao={<button onClick={aoSair} style={{ background: "#EFE9DA", border: "none", borderRadius: 10,
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer" }}><LogOut size={16} color={GREEN} /></button>} />
      <a href="https://wa.me/5514991528623" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "#fff", textDecoration: "none", padding: "10px 16px", borderRadius: 10, fontWeight: "bold", fontSize: 14, marginBottom: 16 }}>
              💬 Falar com a Michelle
            </a>

      {notificacoes.map((n) => (
        <Card key={n.id} style={{ marginBottom: 12, borderLeft: `4px solid ${CORAL}`, background: "#FFF9F5" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Bell size={16} color={CORAL} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 5 }}>{n.titulo}</div>
              <div style={{ fontSize: 12.5, color: MUTED, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{n.corpo}</div>
              <button onClick={() => marcarLida(n.id)}
                style={{ background: "none", border: "none", color: SAGE, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", padding: "8px 0 0", fontFamily: "inherit" }}>
                Entendi
              </button>
            </div>
          </div>
        </Card>
      ))}

      {criancas.length === 0 ? (
        <Vazio titulo="Vamos começar pela triagem"
          texto="São algumas perguntas sobre seu filho e a rotina de vocês. A Michelle usa as respostas para montar o plano.">
          <Botao icone={Plus} onClick={() => setTela("triagem")}>Preencher triagem</Botao>
        </Vazio>
      ) : (
        <>
          {criancas.map((c) => (
            <Card key={c.id} style={{ marginBottom: 12 }} onClick={() => { setAtualId(c.id); setTela("crianca"); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                    {c.plano?.status === "approved"
                      ? `${c.registrosSemana.length} de 4 atividades esta semana`
                      : "Triagem enviada — aguardando a Michelle"}
                  </div>
                  <div style={{ fontSize: 11, color: GREEN, marginTop: 2 }}>🏆 {c.gamificacao?.total_pontos ?? 0} pts · {c.gamificacao?.total_selos ?? 0} selos</div>
                </div>
                <ChevronRight size={18} color={SAGE} style={{ flexShrink: 0 }} />
              </div>
            </Card>
          ))}
          <div style={{ marginTop: 16 }}>
            <Botao variante="contorno" icone={Plus} onClick={() => setTela("triagem")}>
              Nova triagem
            </Botao>
          </div>
        </>
      )}
    </div>
  );
}

function TelaFamiliaCrianca({ crianca, aoVoltar, usuario, aoRegistrar }) {
  const [aba, setAba] = useState("plano");
  const plano = crianca.plano?.dados;
  const liberado = crianca.plano?.status === "approved";

  return (
    <div>
      <Cabecalho titulo={crianca.nome} subtitulo={`${crianca.idade || "—"} anos`} aoVoltar={aoVoltar} />
      <PainelGamificacao pontos={crianca.gamificacao?.total_pontos} selos={crianca.gamificacao?.total_selos} sequencia={crianca.gamificacao?.sequencia_atual} />

      {!liberado ? (
        <Vazio titulo="A Michelle está montando o plano"
          texto="Ela lê cada resposta da triagem antes de liberar as atividades. Assim que estiver pronto, aparece aqui." />
      ) : (
        <>
          <div style={{ display: "flex", gap: 4, background: "#F2EFE9", borderRadius: 13,
            padding: 4, marginBottom: 16 }}>
            <Aba ativa={aba === "plano"} onClick={() => setAba("plano")}>Plano</Aba>
            <Aba ativa={aba === "registro"} onClick={() => setAba("registro")}>Registrar</Aba>
            <Aba ativa={aba === "conversa"} onClick={() => setAba("conversa")}>Conversar</Aba>
          </div>

          {aba === "plano" && <PlanoFamilia crianca={crianca} plano={plano} />}
          {aba === "registro" && <RegistroFamilia crianca={crianca} plano={plano} aoSalvar={aoRegistrar} />}
          {aba === "conversa" && <Conversa criancaId={crianca.id} usuario={usuario} ehMichelle={false} />}
        </>
      )}
    </div>
  );
}

function MateriaisDaSemana({ plano }) {
  const linhas = plano.dias.map((d) => ({
    dia: d.dia,
    jogo: d.jogo?.titulo,
    materiais: d.jogo?.materiais,
    pronto: !!materialProntoDe(d.jogo),
  }));

  return (
    <Card style={{ marginBottom: 14 }}>
      <Rotulo>O que separar para a semana</Rotulo>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 14, lineHeight: 1.5 }}>
        Dá uma olhada antes de começar a semana — assim não falta nada na hora da atividade.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {linhas.map((l) => (
          <div key={l.dia} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EFE9DA", color: GREEN,
              fontWeight: 700, fontSize: 11.5, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1 }}>
              {l.dia}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{l.jogo}</div>
              {l.pronto ? (
                <div style={{ fontSize: 12, color: SAGE, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <Printer size={12} /> Já vem pronto no app — só abrir e (se quiser) imprimir
                </div>
              ) : (
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{l.materiais}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PlanoFamilia({ crianca, plano }) {
  const [abrindo, setAbrindo] = useState(null); // dia sendo aberto para aplicar/imprimir
  if (!plano) return null;

  if (abrindo) {
    return <FolhaAtividade crianca={crianca} dia={abrindo} aoFechar={() => setAbrindo(null)} />;
  }

  return (
    <div>
      {plano.mensagemAbertura && (
        <Card style={{ marginBottom: 14, borderLeft: `4px solid ${GREEN}`, background: "#FAFBF8" }}>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {plano.mensagemAbertura}
          </div>
          <div style={{ fontSize: 12, color: SAGE, marginTop: 12, fontStyle: "italic" }}>— Michelle</div>
        </Card>
      )}

      {crianca.feedback && (
        <Card style={{ marginBottom: 14, borderLeft: `4px solid ${CORAL}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase",
            letterSpacing: .5, marginBottom: 8 }}>
            Feedback desta semana
          </div>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {crianca.feedback.conteudo}
          </div>
        </Card>
      )}

      {plano.pontosFortes && (
        <Card style={{ marginBottom: 14 }}>
          <Rotulo>Pontos fortes da {crianca.nome}</Rotulo>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.55 }}>{plano.pontosFortes}</div>
        </Card>
      )}

      <MateriaisDaSemana plano={plano} />

      <Card style={{ marginBottom: 14 }}>
        <Rotulo>Atividades da semana — {plano.duracaoSessao} min por dia</Rotulo>
        {plano.dias.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "13px 0",
            borderBottom: i < plano.dias.length - 1 ? `1px solid #F2EDE2` : "none" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%",
              background: d.dia % 2 ? GREEN : CORAL, color: "#fff", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {d.dia}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: CORAL, textTransform: "uppercase" }}>
                {d.habilidade}
              </div>
              <div style={{ fontWeight: 700, color: INK, fontSize: 14.5, margin: "2px 0 5px" }}>
                {d.jogo?.titulo}
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{d.jogo?.objetivo}</div>
              {d.observacaoEspecifica && (
                <div style={{ fontSize: 12, color: INK, background: "#FFF4EC", borderLeft: `3px solid ${CORAL}`,
                  borderRadius: 6, padding: "7px 10px", marginBottom: 8, lineHeight: 1.5 }}>
                  {d.observacaoEspecifica}
                </div>
              )}
              <button onClick={() => setAbrindo(d)} style={{ display: "flex", alignItems: "center", gap: 6,
                background: materialProntoDe(d.jogo) ? GREEN : "#EFE9DA", color: materialProntoDe(d.jogo) ? "#fff" : GREEN,
                border: "none", borderRadius: 9, padding: "8px 13px", fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit" }}>
                <Printer size={13} />
                {materialProntoDe(d.jogo) ? "Abrir atividade pronta" : "Abrir para aplicar"}
              </button>
            </div>
          </div>
        ))}
      </Card>

      {plano.orientacoes?.length > 0 && (
        <Card>
          <Rotulo>Orientações da Michelle</Rotulo>
          <ul style={{ margin: 0, paddingLeft: 17 }}>
            {plano.orientacoes.map((o, i) => (
              <li key={i} style={{ fontSize: 13, color: INK, lineHeight: 1.55, marginBottom: 8 }}>{o}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function RegistroFamilia({ crianca, plano, aoSalvar }) {
  const [dia, setDia] = useState(plano?.dias[0]?.dia ?? 1);
  const [conseguiu, setConseguiu] = useState("");
  const [obs, setObs] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [pronto, setPronto] = useState(false);

  const feitosHoje = crianca.registrosSemana.filter((r) => r.date === hoje());
  const diaAtual = plano?.dias.find((d) => d.dia === dia);

  async function salvar() {
    setOcupado(true);
    try {
      await supabase.from("registros").insert({
        crianca_id: crianca.id, date: hoje(), dia,
        atividade: diaAtual?.jogo?.titulo, conseguiu, obs,
      });
      setPronto(true);
      setConseguiu(""); setObs("");
      await aoSalvar();
      setTimeout(() => setPronto(false), 2600);
    } finally {
      setOcupado(false);
    }
  }

  if (pronto) {
    return (
      <Card style={{ textAlign: "center", padding: 32 }}>
        <Check size={30} color={SAGE} style={{ margin: "0 auto 10px" }} />
        <div style={{ fontWeight: 700, color: GREEN, fontSize: 15 }}>Registro salvo</div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
          A Michelle já consegue ver por lá.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Rotulo>Qual atividade vocês fizeram?</Rotulo>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
        {plano?.dias.map((d) => {
          const jaFeito = feitosHoje.some((r) => r.dia === d.dia);
          return (
            <button key={d.dia} onClick={() => setDia(d.dia)}
              style={{ textAlign: "left", padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 9,
                border: dia === d.dia ? "none" : `1px solid ${LINE}`,
                background: dia === d.dia ? GREEN : "#fff",
                color: dia === d.dia ? "#fff" : INK }}>
              {jaFeito && <Check size={14} strokeWidth={3} />}
              <span><b>Dia {d.dia}</b> · {d.jogo?.titulo}</span>
            </button>
          );
        })}
      </div>

      <Rotulo>Conseguiu fazer sozinho?</Rotulo>
      <div style={{ display: "flex", gap: 7, marginBottom: 18 }}>
        {["Sim", "Com ajuda", "Não"].map((o) => (
          <button key={o} onClick={() => setConseguiu(o)}
            style={{ flex: 1, padding: "11px 6px", borderRadius: 11, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              border: conseguiu === o ? "none" : `1px solid ${LINE}`,
              background: conseguiu === o ? SAGE : "#fff",
              color: conseguiu === o ? "#fff" : INK }}>
            {o}
          </button>
        ))}
      </div>

      <Rotulo>Quer contar mais alguma coisa?</Rotulo>
      <textarea value={obs} onChange={(e) => setObs(e.target.value)}
        placeholder="Onde travou, como estava o humor, o que te chamou atenção…"
        style={{ width: "100%", padding: 12, borderRadius: 11, border: `1px solid ${LINE}`,
          fontSize: 13.5, minHeight: 80, fontFamily: "inherit", lineHeight: 1.5,
          marginBottom: 16, resize: "vertical" }} />

      <Botao largo variante="coral" onClick={salvar} ocupado={ocupado} desabilitado={!conseguiu}>
        Salvar registro
      </Botao>
    </Card>
  );
}

// ============================================
// LADO DA MICHELLE
// ============================================
function AppMichelle({ usuario, aoSair }) {
  const [aba, setAba] = useState("criancas");
  const [criancas, setCriancas] = useState([]);
  const [atualId, setAtualId] = useState(null);
  const [tela, setTela] = useState("lista");
  const [planoEditado, setPlanoEditado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("criancas").select("*").order("created_at", { ascending: false });
    for (const c of data || []) {
      const [{ data: plano }, { data: triagem }, { data: regs }, { data: regsTodos }, { count: msgsNaoLidas },{ data: gam}] = await Promise.all([
        supabase.from("planos").select("*").eq("crianca_id", c.id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("triagens").select("*").eq("crianca_id", c.id).maybeSingle(),
        supabase.from("registros").select("*").eq("crianca_id", c.id)
          .gte("date", inicioDaSemana()),
        supabase.from("registros").select("*").eq("crianca_id", c.id),
        supabase.from("mensagens_chat").select("id", { count: "exact", head: true })
          .eq("crianca_id", c.id).eq("lida", false).neq("user_id", usuario.id),
        supabase.from("gamificacao_crianca").select("*").eq("crianca_id", c.id).maybeSingle(),
      ]);
      c.plano = plano;
      c.gamificacao = gam || { total_pontos: 0, total_selos: 0, sequencia_atual: 0 };
      c.triagem = triagem;
      c.registrosSemana = regs || [];
     if (c.plano && c.plano.status === "approved" && c.plano.approved_at && triagem) {
          const dias = (Date.now() - new Date(c.plano.approved_at).getTime()) / 86400000;
          if (dias >= 6) {
            const historico = regsTodos || [];
            const novoPlano = gerarPlanoComHistorico(triagemDoBanco(triagem), BIBLIOTECA, historico, c.plano.dados);
            await supabase.from("planos").insert({ crianca_id: c.id, dados: novoPlano, status: "pending" });
          }
        } 
      c.mensagensNaoLidas = msgsNaoLidas || 0;
    }
    setCriancas(data || []);
    setCarregando(false);
  }, [usuario.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const atual = criancas.find((c) => c.id === atualId);

  async function aprovarPlano() {
    setOcupado(true);
    try {
      await supabase.from("planos")
        .update({ dados: { ...planoEditado, aprovado: true }, status: "approved", approved_at: new Date().toISOString() })
        .eq("id", atual.plano.id);
      setTela("crianca");
      await carregar();
    } finally {
      setOcupado(false);
    }
  }

  function regerar() {
    if (!atual?.triagem) return;
    setPlanoEditado(gerarPlano(triagemDoBanco(atual.triagem), BIBLIOTECA));
  }

  if (carregando) return <Carregando />;

  if (tela === "revisao" && atual && planoEditado) {
    return (
      <RevisaoPlano crianca={atual} plano={planoEditado} biblioteca={BIBLIOTECA}
        onChange={setPlanoEditado} onAprovar={aprovarPlano} onRegerar={regerar} salvando={ocupado} />
    );
  }

  if (tela === "crianca" && atual) {
    return <TelaMichelleCrianca crianca={atual} usuario={usuario}
      aoVoltar={() => { setTela("lista"); carregar(); }}
      aoRevisar={() => { setPlanoEditado(atual.plano.dados); setTela("revisao"); }}
      aoAtualizar={carregar} />;
  }

  const pendentes = criancas.filter((c) => c.plano?.status === "pending");
  const ativas = criancas.filter((c) => c.plano?.status === "approved");
  const emDia = ativas.filter((c) => c.registrosSemana.length > 0);

  return (
    <div>
      <Cabecalho titulo="Painel da Michelle" subtitulo={`${ativas.length} crianças acompanhadas`}
        acao={<button onClick={aoSair} style={{ background: "#EFE9DA", border: "none", borderRadius: 10,
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer" }}><LogOut size={16} color={GREEN} /></button>} />

      <div style={{ display: "flex", gap: 4, background: "#F2EFE9", borderRadius: 13,
        padding: 4, marginBottom: 18 }}>
        <Aba ativa={aba === "criancas"} onClick={() => setAba("criancas")}>Crianças</Aba>
        <Aba ativa={aba === "lembretes"} onClick={() => setAba("lembretes")}>Lembretes</Aba>
      </div>

      {aba === "lembretes" ? (
        <PainelLembretes supabase={supabase} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <Numero valor={pendentes.length} rotulo="Aguardando você" cor={CORAL} />
            <Numero valor={emDia.length} rotulo="Em dia" cor={GREEN} />
            <Numero valor={ativas.length - emDia.length} rotulo="Sem registro" cor={SAGE} />
            {criancas.reduce((s, c) => s + (c.mensagensNaoLidas || 0), 0) > 0 && (
              <Numero valor={criancas.reduce((s, c) => s + (c.mensagensNaoLidas || 0), 0)} rotulo="Mensagens novas" cor={CORAL} />
            )}
          </div>

          {pendentes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Rotulo>Triagens novas</Rotulo>
              {pendentes.map((c) => (
                <Card key={c.id} style={{ marginBottom: 10, borderLeft: `4px solid ${CORAL}` }}
                  onClick={() => { setAtualId(c.id); setTela("crianca"); }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>{c.nome}</div>
                      <div style={{ fontSize: 12, color: CORAL, marginTop: 3 }}>
                        Plano pronto para revisar
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {c.mensagensNaoLidas > 0 && <BadgeMensagem n={c.mensagensNaoLidas} />}
                      <ChevronRight size={18} color={SAGE} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {ativas.length > 0 && <Rotulo>Em acompanhamento</Rotulo>}
          {ativas.map((c) => (
            <Card key={c.id} style={{ marginBottom: 10 }}
              onClick={() => { setAtualId(c.id); setTela("crianca"); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                    {c.registrosSemana.length} de 4 registros nesta semana
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {c.mensagensNaoLidas > 0 && <BadgeMensagem n={c.mensagensNaoLidas} />}
                  <Pastilha ok={c.registrosSemana.length > 0} />
                </div>
              </div>
            </Card>
          ))}

          {criancas.length === 0 && (
            <Vazio titulo="Nenhuma família ainda"
              texto="Quando alguém preencher a triagem, ela aparece aqui para você revisar." />
          )}
        </>
      )}
    </div>
  );
}

function TelaMichelleCrianca({ crianca, usuario, aoVoltar, aoRevisar, aoAtualizar }) {
  const [aba, setAba] = useState("semana");
  const liberado = crianca.plano?.status === "approved";

  return (
    <div>
      <Cabecalho titulo={crianca.nome} subtitulo={`${crianca.idade || "—"} anos`} aoVoltar={aoVoltar} />

      {!liberado ? (
        <>
          <Card style={{ marginBottom: 14, borderLeft: `4px solid ${CORAL}` }}>
            <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.55, marginBottom: 14 }}>
              A triagem chegou e o rascunho do plano está pronto. A família só vê depois que você aprovar.
            </div>
            <Botao largo variante="coral" onClick={aoRevisar}>Revisar plano</Botao>
          </Card>
          <ResumoTriagem triagem={crianca.triagem} />
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 4, background: "#F2EFE9", borderRadius: 13,
            padding: 4, marginBottom: 16 }}>
            <Aba ativa={aba === "semana"} onClick={() => setAba("semana")}>Semana</Aba>
            <Aba ativa={aba === "feedback"} onClick={() => setAba("feedback")}>Feedback</Aba>
            <Aba ativa={aba === "conversa"} onClick={() => setAba("conversa")}>Conversar</Aba>
            <Aba ativa={aba === "triagem"} onClick={() => setAba("triagem")}>Triagem</Aba>
          </div>

          {aba === "semana" && <SemanaMichelle crianca={crianca} aoRevisar={aoRevisar} />}
          {aba === "feedback" && <FeedbackSemanal crianca={crianca} usuario={usuario} aoSalvar={aoAtualizar} />}
          {aba === "conversa" && <Conversa criancaId={crianca.id} usuario={usuario} ehMichelle criancaUserId={crianca.user_id} nomeCrianca={crianca.nome} />}
          {aba === "triagem" && <ResumoTriagem triagem={crianca.triagem} />}
        </>
      )}
    </div>
  );
}

function SemanaMichelle({ crianca, aoRevisar }) {
  const plano = crianca.plano?.dados;
  const regs = crianca.registrosSemana;

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <Rotulo>Registros desta semana — {regs.length} de 4</Rotulo>
        {regs.length === 0 ? (
          <div style={{ fontSize: 13, color: MUTED, display: "flex", gap: 7, alignItems: "center" }}>
            <AlertCircle size={15} color={CORAL} /> Nenhum registro ainda nesta semana.
          </div>
        ) : (
          regs.map((r, i) => (
            <div key={i} style={{ padding: "11px 0",
              borderBottom: i < regs.length - 1 ? `1px solid #F2EDE2` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 700, color: INK, fontSize: 13.5 }}>{r.atividade}</div>
                <div style={{ fontSize: 11.5, color: MUTED, flexShrink: 0 }}>{formatarData(r.date)}</div>
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Conseguiu: {r.conseguiu}</div>
              {r.obs && (
                <div style={{ fontSize: 12.5, color: INK, marginTop: 6, fontStyle: "italic",
                  background: "#F9F7F2", borderRadius: 9, padding: "9px 11px", lineHeight: 1.5 }}>
                  "{r.obs}"
                </div>
              )}
            </div>
          ))
        )}
      </Card>

      {plano && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Rotulo>Plano em vigor</Rotulo>
            <button onClick={aoRevisar} style={{ background: "none", border: "none", color: GREEN,
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Editar
            </button>
          </div>
          {plano.dias.map((d, i) => (
            <div key={i} style={{ fontSize: 13, color: INK, padding: "6px 0" }}>
              <b>Dia {d.dia}</b> · {d.jogo?.titulo}
              <span style={{ color: MUTED }}> — {d.habilidade}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function FeedbackSemanal({ crianca, usuario, aoSalvar }) {
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [anteriores, setAnteriores] = useState([]);
  const semana = inicioDaSemana();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("feedback_semanal").select("*")
        .eq("crianca_id", crianca.id).order("semana_inicio", { ascending: false });
      setAnteriores(data || []);
      const desta = (data || []).find((f) => f.semana_inicio === semana);
      if (desta) setTexto(desta.conteudo);
    })();
  }, [crianca.id, semana]);

  async function salvar() {
    setOcupado(true);
    try {
      await supabase.from("feedback_semanal").upsert({
        crianca_id: crianca.id, semana_inicio: semana,
        conteudo: texto, criado_por: usuario.id,
      }, { onConflict: "crianca_id,semana_inicio" });

      await supabase.from("notificacoes").insert({
        crianca_id: crianca.id, user_id: crianca.user_id,
        titulo: `Feedback da semana — ${crianca.nome}`,
        corpo: texto,
      });
      await aoSalvar();
    } finally {
      setOcupado(false);
    }
  }

  const regs = crianca.registrosSemana;

  return (
    <div>
      {regs.length > 0 && (
        <Card style={{ marginBottom: 14, background: "#F9F7F2" }}>
          <Rotulo>Do que a família contou</Rotulo>
          {regs.map((r, i) => (
            <div key={i} style={{ fontSize: 12.5, color: INK, marginBottom: 6, lineHeight: 1.5 }}>
              <b>{r.atividade}:</b> {r.conseguiu}{r.obs ? ` — "${r.obs}"` : ""}
            </div>
          ))}
        </Card>
      )}

      <Card style={{ marginBottom: 14 }}>
        <Rotulo>Seu feedback desta semana</Rotulo>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder={`O que você percebeu na semana da ${crianca.nome} e o que sugere para a próxima.`}
          style={{ width: "100%", padding: 12, borderRadius: 11, border: `1px solid ${LINE}`,
            fontSize: 13.5, minHeight: 150, fontFamily: "inherit", lineHeight: 1.6,
            marginBottom: 14, resize: "vertical" }} />
        <Botao largo icone={Send} onClick={salvar} ocupado={ocupado} desabilitado={!texto.trim()}>
          Enviar para a família
        </Botao>
      </Card>

      {anteriores.filter((f) => f.semana_inicio !== semana).length > 0 && (
        <Card>
          <Rotulo>Semanas anteriores</Rotulo>
          {anteriores.filter((f) => f.semana_inicio !== semana).map((f) => (
            <div key={f.id} style={{ padding: "11px 0", borderBottom: `1px solid #F2EDE2` }}>
              <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 5 }}>
                semana de {formatarData(f.semana_inicio)}
              </div>
              <div style={{ fontSize: 12.5, color: INK, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {f.conteudo}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Conversa({ criancaId, usuario, ehMichelle, criancaUserId, nomeCrianca }) {
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("mensagens_chat").select("*")
      .eq("crianca_id", criancaId).order("created_at");
    setMensagens(data || []);

    // Marca como lidas as mensagens que o outro lado escreveu.
    const naoLidas = (data || []).filter((m) => m.user_id !== usuario.id && !m.lida);
    if (naoLidas.length) {
      await supabase.from("mensagens_chat").update({ lida: true })
        .in("id", naoLidas.map((m) => m.id));
    }
  }, [criancaId, usuario.id]);

  useEffect(() => {
    carregar();
    const canal = supabase.channel(`chat-${criancaId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens_chat", filter: `crianca_id=eq.${criancaId}` },
        () => carregar())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [criancaId, carregar]);

  async function enviar() {
    if (!texto.trim()) return;
    setOcupado(true);
    try {
      await supabase.from("mensagens_chat").insert({
        crianca_id: criancaId, user_id: usuario.id, conteudo: texto.trim(),
      });
      // Quando é a Michelle escrevendo, a família recebe o aviso no topo do app dela,
      // do mesmo jeito que já recebe o feedback semanal.
      if (ehMichelle && criancaUserId) {
        await supabase.from("notificacoes").insert({
          crianca_id: criancaId, user_id: criancaUserId,
          titulo: `Nova mensagem de Michelle${nomeCrianca ? ` — ${nomeCrianca}` : ""}`,
          corpo: texto.trim(),
        });
      }
      setTexto("");
      await carregar();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Card>
      <div style={{ minHeight: 220, maxHeight: 380, overflowY: "auto", marginBottom: 14,
        display: "flex", flexDirection: "column", gap: 9 }}>
        {mensagens.length === 0 && (
          <div style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "40px 20px", lineHeight: 1.5 }}>
            {ehMichelle
              ? "Nenhuma mensagem ainda. A família pode escrever por aqui quando tiver dúvida."
              : "Alguma dúvida sobre as atividades? Escreva aqui que a Michelle responde."}
          </div>
        )}
        {mensagens.map((m) => {
          const minha = m.user_id === usuario.id;
          return (
            <div key={m.id} style={{ alignSelf: minha ? "flex-end" : "flex-start", maxWidth: "82%" }}>
              <div style={{ background: minha ? GREEN : "#F2EFE9", color: minha ? "#fff" : INK,
                padding: "10px 13px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.5,
                whiteSpace: "pre-wrap" }}>
                {m.conteudo}
              </div>
              <div style={{ fontSize: 10.5, color: MUTED, marginTop: 3,
                textAlign: minha ? "right" : "left" }}>
                {formatarHora(m.created_at)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escreva sua mensagem"
          style={{ flex: 1, padding: 12, borderRadius: 11, border: `1px solid ${LINE}`,
            fontSize: 13.5, fontFamily: "inherit" }} />
        <button onClick={enviar} disabled={ocupado || !texto.trim()}
          style={{ background: GREEN, border: "none", borderRadius: 11, width: 46,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", opacity: texto.trim() ? 1 : .4 }}>
          <Send size={17} color="#fff" />
        </button>
      </div>
    </Card>
  );
}

function ResumoTriagem({ triagem }) {
  if (!triagem) return <Vazio titulo="Triagem não encontrada" texto="Esta criança ainda não tem triagem registrada." />;

  const blocos = [
    ["Preocupação principal", triagem.preocupacao_principal],
    ["Há quanto tempo", triagem.tempo_dificuldade],
    ["O que mais preocupa", (triagem.o_que_mais_preocupa || []).join(", ")],
    ["Diagnóstico", triagem.tem_diagnostico === "Não" ? null : `${triagem.tem_diagnostico} — ${triagem.qual_diagnostico || "não especificado"}`],
    ["Medicação", triagem.usa_medicacao === "Não" ? null : triagem.qual_medicacao],
    ["Acompanhamentos", (triagem.acompanhamentos || []).join(", ")],
    ["Escola e série", [triagem.escola, triagem.serie].filter(Boolean).join(" · ")],
    ["Responsáveis", triagem.responsaveis],
    ["Contato", [triagem.telefone, triagem.email].filter(Boolean).join(" · ")],
    ["Sono", triagem.sono],
    ["Tempo de tela", triagem.tempo_tela],
    ["Atividade física", triagem.atividade_fisica],
    ["Tarefas sozinho", triagem.tarefas_sozinho],
    ["Como aprende", (triagem.como_aprende || []).join(", ")],
    ["Costuma", (triagem.como_costuma || []).join(", ")],
    ["Reação ao erro", (triagem.reacao_erro || []).join(", ")],
    ["Concentração", triagem.tempo_concentracao],
    ["Quem aplica", triagem.responsavel_atividades],
    ["Melhor período", triagem.melhor_periodo],
    ["Consegue 20 min", triagem.consegue_20min],
    ["Dificuldades previstas", (triagem.dificuldades || []).join(", ")],
    ["A família acrescentou", triagem.info_adicional],
  ].filter(([, v]) => v);

  const habs = Object.entries(triagem.habilidades || {});
  const rotulos = { 2: "Precisa de muito estímulo", 1: "Em desenvolvimento", 0: "Bem desenvolvida" };
  const cores = { 2: "#E05A3C", 1: "#E8A93C", 0: GREEN };

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <Rotulo>Respostas da família</Rotulo>
        {blocos.map(([rotulo, valor]) => (
          <div key={rotulo} style={{ padding: "9px 0", borderBottom: `1px solid #F5F1E8` }}>
            <div style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase",
              letterSpacing: .4, fontWeight: 700, marginBottom: 3 }}>
              {rotulo}
            </div>
            <div style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{valor}</div>
          </div>
        ))}
      </Card>

      {habs.length > 0 && (
        <Card>
          <Rotulo>Mapeamento das habilidades</Rotulo>
          {habs.map(([nome, nivel]) => (
            <div key={nome} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "8px 0", borderBottom: `1px solid #F5F1E8` }}>
              <span style={{ fontSize: 13, color: INK }}>{nome}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cores[nivel],
                textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                {rotulos[nivel]}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ===== Auxiliares =====
function Rotulo({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase",
      letterSpacing: .6, marginBottom: 11 }}>
      {children}
    </div>
  );
}

function Numero({ valor, rotulo, cor }) {
  return (
    <Card style={{ flex: 1, textAlign: "center", padding: 14 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: cor }}>{valor}</div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.3 }}>{rotulo}</div>
    </Card>
  );
}

function Pastilha({ ok }) {
  return (
    <span style={{ background: ok ? "#EAF0E4" : "#FFF3EC", color: ok ? GREEN : CORAL,
      padding: "5px 11px", borderRadius: 9, fontSize: 10.5, fontWeight: 700,
      textTransform: "uppercase", flexShrink: 0 }}>
      {ok ? "Em dia" : "Sem registro"}
    </span>
  );
}

function BadgeMensagem({ n }) {
  return (
    <span style={{ background: CORAL, color: "#fff", borderRadius: 20, padding: "4px 9px",
      fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <MessageSquare size={11} />{n}
    </span>
  );
}

function Carregando() {
  return <div style={{ padding: 60, textAlign: "center", color: MUTED, fontSize: 13.5 }}>Carregando…</div>;
}

function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}`;
}

function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Converte a linha do banco (snake_case) para o formato que o gerador espera. */
function triagemDoBanco(t) {
  return {
    nome: t.nome, idade: t.idade,
    preocupacaoPrincipal: t.preocupacao_principal,
    tempoDificuldade: t.tempo_dificuldade,
    temDiagnostico: t.tem_diagnostico, qualDiagnostico: t.qual_diagnostico,
    usaMedicacao: t.usa_medicacao, qualMedicacao: t.qual_medicacao,
    acompanhamentos: t.acompanhamentos || [],
    oQueMaisPreocupa: t.o_que_mais_preocupa || [],
    sono: t.sono, tempoTela: t.tempo_tela, tarefasSozinho: t.tarefas_sozinho,
    brincar: t.brincar, atividadeFisica: t.atividade_fisica,
    comoAprende: t.como_aprende || [], comoCostuma: t.como_costuma || [],
    reacaoErro: t.reacao_erro || [], tempoConcentracao: t.tempo_concentracao,
    sociabilidade: t.sociabilidade, extracurricular: t.extracurricular,
    qualExtracurricular: t.qual_extracurricular,
    melhorPeriodo: t.melhor_periodo, consegue20min: t.consegue_20min,
    dificuldades: t.dificuldades || [], infoAdicional: t.info_adicional,
    habilidades: t.habilidades || {},
  };
}

// ===== Raiz =====
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [ehMichelle, setEhMichelle] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => definir(data.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_, sessao) => definir(sessao?.user));
    return () => sub.subscription.unsubscribe();

    async function definir(u) {
      setUsuario(u || null);
      if (u) {
        const { data } = await supabase.from("admin_profile").select("id").eq("user_id", u.id).maybeSingle();
        setEhMichelle(!!data);
      }
      setCarregando(false);
    }
  }, []);

  const sair = () => supabase.auth.signOut();

  return (
    <div style={{ background: CREAM, minHeight: "100vh", color: INK,
      fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 18px 60px" }}>
        {carregando ? <Carregando />
          : !usuario ? <Entrada aoEntrar={setUsuario} />
          : ehMichelle ? <AppMichelle usuario={usuario} aoSair={sair} />
          : <AppFamilia usuario={usuario} aoSair={sair} />}
      </div>
    </div>
  );
}

