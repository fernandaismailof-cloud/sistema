import { useState, useRef, useEffect, useCallback } from "react";

const BRAND = {
  green: "#1B6B3A",
  greenLight: "#238C4E",
  greenDark: "#145A2F",
  greenPale: "#EBF5EE",
  greenMuted: "rgba(27,107,58,0.12)",
  bg: "#F4F6F4",
  bgCard: "#ffffff",
  text: "#1A2E1F",
  textMuted: "#5f7a68",
  textLight: "#9ab5a0",
  border: "rgba(27,107,58,0.15)",
  red: "#C0392B",
  redPale: "#FDF0EE",
};

const CATEGORIES = {
  receita: { label: "Receita", color: BRAND.green, bg: BRAND.greenPale },
  consulta: { label: "Consulta", color: BRAND.green, bg: BRAND.greenPale },
  cirurgia: { label: "Cirurgia", color: "#1A6B5A", bg: "#EBF5F3" },
  vacina: { label: "Vacina", color: "#2E7D32", bg: "#E8F5E9" },
  exame: { label: "Exame", color: "#00695C", bg: "#E0F2F1" },
  equipamento: { label: "Equipamento", color: "#5D4037", bg: "#EFEBE9" },
  medicamento: { label: "Medicamento", color: "#6A1B9A", bg: "#F3E5F5" },
  insumo: { label: "Insumo", color: "#E65100", bg: "#FFF3E0" },
  aluguel: { label: "Aluguel", color: "#283593", bg: "#E8EAF6" },
  funcionario: { label: "Funcionário", color: "#00838F", bg: "#E0F7FA" },
  marketing: { label: "Marketing", color: "#AD1457", bg: "#FCE4EC" },
  outro: { label: "Outro", color: "#546E7A", bg: "#ECEFF1" },
};

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : null;
};

const PawIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="12" cy="17" rx="5" ry="4" />
    <ellipse cx="6.5" cy="12.5" rx="2.5" ry="3.2" transform="rotate(-15 6.5 12.5)" />
    <ellipse cx="17.5" cy="12.5" rx="2.5" ry="3.2" transform="rotate(15 17.5 12.5)" />
    <ellipse cx="9" cy="8.5" rx="2" ry="2.8" transform="rotate(-10 9 8.5)" />
    <ellipse cx="15" cy="8.5" rx="2" ry="2.8" transform="rotate(10 15 8.5)" />
  </svg>
);

const formatCurrency = (val) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${BRAND.bg};
    color: ${BRAND.text};
    min-height: 100vh;
  }

  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 480px;
    margin: 0 auto;
    background: ${BRAND.bgCard};
    box-shadow: 0 0 60px rgba(0,0,0,0.08);
    position: relative;
    overflow: hidden;
  }

  /* HEADER */
  .header {
    background: ${BRAND.green};
    padding: 14px 20px 0;
    flex-shrink: 0;
    position: relative;
  }

  .header-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .logo-mark {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-text {
    color: white;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .logo-text span { font-weight: 300; opacity: 0.85; }

  .balance-pill {
    margin-left: auto;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 5px 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .balance-label {
    color: rgba(255,255,255,0.7);
    font-size: 9px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1;
  }

  .balance-value {
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    line-height: 1.3;
  }

  .balance-value.negative { color: #ff8a80; }

  /* TABS */
  .tabs {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }

  .tab {
    flex: 1;
    padding: 10px 8px;
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    border: none;
    background: transparent;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
  }

  .tab.active {
    color: white;
    font-weight: 600;
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20%;
    right: 20%;
    height: 2px;
    background: white;
    border-radius: 2px 2px 0 0;
  }

  .tab:hover:not(.active) { color: rgba(255,255,255,0.85); }

  /* TAB BADGE */
  .tab-badge {
    background: rgba(255,255,255,0.25);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }

  .tab.active .tab-badge {
    background: rgba(255,255,255,0.35);
  }

  /* CONTENT AREA */
  .content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  .content::-webkit-scrollbar { width: 4px; }
  .content::-webkit-scrollbar-track { background: transparent; }
  .content::-webkit-scrollbar-thumb { background: ${BRAND.border}; border-radius: 4px; }

  /* CHAT */
  .chat-container { padding: 16px 16px 8px; display: flex; flex-direction: column; gap: 10px; }

  /* WELCOME CARD */
  .welcome-card {
    background: ${BRAND.greenPale};
    border: 1px solid ${BRAND.border};
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 4px;
  }

  .welcome-card p {
    font-size: 13.5px;
    color: ${BRAND.text};
    line-height: 1.6;
    margin-bottom: 4px;
  }

  .welcome-card p:last-child { margin-bottom: 0; }
  .welcome-card strong { color: ${BRAND.green}; }
  .welcome-card em { color: ${BRAND.textMuted}; font-style: italic; font-size: 12.5px; }

  /* MESSAGES */
  .msg-row {
    display: flex;
    gap: 8px;
    animation: slideIn 0.25s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg-row.user { justify-content: flex-end; }
  .msg-row.assistant { justify-content: flex-start; }

  .msg-avatar {
    width: 28px;
    height: 28px;
    background: ${BRAND.green};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .msg-bubble {
    max-width: 82%;
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 13.5px;
    line-height: 1.55;
  }

  .msg-row.user .msg-bubble {
    background: ${BRAND.green};
    color: white;
    border-bottom-right-radius: 4px;
  }

  .msg-row.assistant .msg-bubble {
    background: ${BRAND.bg};
    color: ${BRAND.text};
    border-bottom-left-radius: 4px;
    border: 1px solid ${BRAND.border};
  }

  /* ENTRY CARD inside assistant message */
  .entry-card {
    background: white;
    border: 1px solid ${BRAND.border};
    border-radius: 12px;
    padding: 12px 14px;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .entry-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .entry-cat-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .entry-type-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
  }

  .entry-type-badge.receita {
    background: ${BRAND.greenPale};
    color: ${BRAND.green};
  }

  .entry-type-badge.despesa {
    background: ${BRAND.redPale};
    color: ${BRAND.red};
  }

  .entry-desc {
    font-size: 13px;
    font-weight: 500;
    color: ${BRAND.text};
    margin-top: 2px;
  }

  .entry-amount-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
  }

  .entry-amount {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 700;
  }

  .entry-amount.receita { color: ${BRAND.green}; }
  .entry-amount.despesa { color: ${BRAND.red}; }

  .entry-date {
    font-size: 11px;
    color: ${BRAND.textLight};
  }

  /* TYPING INDICATOR */
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    background: ${BRAND.textLight};
    border-radius: 50%;
    animation: bounce 1.2s infinite;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-5px); opacity: 1; }
  }

  /* QUICK CHIPS */
  .quick-chips {
    padding: 8px 16px 12px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    flex-shrink: 0;
  }

  .quick-chips::-webkit-scrollbar { display: none; }

  .chip {
    white-space: nowrap;
    padding: 7px 13px;
    border: 1.5px solid ${BRAND.border};
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: ${BRAND.textMuted};
    background: white;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .chip:hover {
    border-color: ${BRAND.green};
    color: ${BRAND.green};
    background: ${BRAND.greenPale};
  }

  /* INPUT AREA */
  .input-area {
    padding: 12px 16px 16px;
    background: white;
    border-top: 1px solid ${BRAND.border};
    flex-shrink: 0;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${BRAND.bg};
    border: 1.5px solid ${BRAND.border};
    border-radius: 24px;
    padding: 6px 6px 6px 14px;
    transition: border-color 0.2s;
  }

  .input-row:focus-within {
    border-color: ${BRAND.green};
    box-shadow: 0 0 0 3px ${BRAND.greenMuted};
  }

  .text-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: ${BRAND.text};
    min-width: 0;
  }

  .text-input::placeholder { color: ${BRAND.textLight}; }

  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    gap: 2px;
    color: white;
  }

  .btn-media {
    background: ${BRAND.greenMuted};
    color: ${BRAND.green};
    width: 32px;
    height: 32px;
  }

  .btn-media:hover { background: rgba(27,107,58,0.2); }

  .btn-send {
    background: ${BRAND.green};
    width: 36px;
    height: 36px;
  }

  .btn-send:hover { background: ${BRAND.greenDark}; }
  .btn-send:disabled { background: ${BRAND.textLight}; cursor: not-allowed; }

  .btn-voice {
    background: ${BRAND.greenMuted};
    color: ${BRAND.green};
    width: 32px;
    height: 32px;
    font-size: 10px;
    font-weight: 700;
  }

  .btn-voice:hover { background: rgba(27,107,58,0.2); }

  .btn-voice.recording {
    background: ${BRAND.red};
    color: white;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.4); }
    50% { box-shadow: 0 0 0 6px rgba(192,57,43,0); }
  }

  .voice-interim {
    font-size: 12px;
    color: ${BRAND.textMuted};
    padding: 4px 14px 0;
    font-style: italic;
  }

  /* PLANILHA TAB */
  .sheet-container { padding: 16px; }

  .sheet-summary-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 16px;
  }

  .sheet-stat-card {
    background: ${BRAND.bg};
    border-radius: 12px;
    padding: 12px;
    text-align: center;
  }

  .sheet-stat-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${BRAND.textLight};
    margin-bottom: 4px;
  }

  .sheet-stat-value {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 700;
  }

  .sheet-stat-value.receita-color { color: ${BRAND.green}; }
  .sheet-stat-value.despesa-color { color: ${BRAND.red}; }
  .sheet-stat-value.saldo-pos { color: ${BRAND.green}; }
  .sheet-stat-value.saldo-neg { color: ${BRAND.red}; }

  .entries-list { display: flex; flex-direction: column; gap: 8px; }

  .entry-row {
    background: white;
    border: 1px solid ${BRAND.border};
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .entry-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .entry-info { flex: 1; min-width: 0; }

  .entry-info-desc {
    font-size: 13.5px;
    font-weight: 500;
    color: ${BRAND.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  .entry-info-meta {
    font-size: 11px;
    color: ${BRAND.textLight};
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .entry-info-cat {
    color: ${BRAND.textMuted};
    font-weight: 500;
  }

  .entry-amount-col {
    text-align: right;
    flex-shrink: 0;
  }

  .entry-amount-col .amount {
    font-family: 'DM Mono', monospace;
    font-size: 13.5px;
    font-weight: 700;
  }

  .amount.receita { color: ${BRAND.green}; }
  .amount.despesa { color: ${BRAND.red}; }

  .entry-amount-col .date {
    font-size: 10.5px;
    color: ${BRAND.textLight};
    margin-top: 2px;
  }

  /* DELETE BUTTON */
  .entry-row:hover .delete-btn { opacity: 1; }

  .delete-btn {
    opacity: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: ${BRAND.textLight};
    padding: 4px;
    border-radius: 6px;
    transition: all 0.15s;
  }

  .delete-btn:hover { color: ${BRAND.red}; background: ${BRAND.redPale}; }

  /* EMPTY STATE */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: ${BRAND.textLight};
  }

  .empty-state-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
  .empty-state h3 { font-size: 15px; font-weight: 600; color: ${BRAND.textMuted}; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; }

  /* RESUMO TAB */
  .resumo-container { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

  .saldo-card {
    background: ${BRAND.green};
    border-radius: 16px;
    padding: 20px;
    color: white;
    text-align: center;
  }

  .saldo-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.75;
    margin-bottom: 6px;
  }

  .saldo-main {
    font-family: 'DM Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .saldo-main.negative { color: #ff8a80; }

  .saldo-sub {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 14px;
  }

  .saldo-sub-item {
    background: rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 8px 14px;
    text-align: center;
  }

  .saldo-sub-label {
    font-size: 10px;
    opacity: 0.7;
    margin-bottom: 2px;
  }

  .saldo-sub-val {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 700;
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${BRAND.textLight};
    margin-bottom: 10px;
  }

  .cat-bar-item {
    margin-bottom: 10px;
  }

  .cat-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .cat-bar-name {
    font-size: 12.5px;
    font-weight: 500;
    color: ${BRAND.text};
  }

  .cat-bar-amount {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: ${BRAND.textMuted};
  }

  .cat-bar-track {
    height: 6px;
    background: ${BRAND.bg};
    border-radius: 6px;
    overflow: hidden;
  }

  .cat-bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.5s ease;
  }

  /* EXPORT BUTTONS */
  .export-row {
    display: flex;
    gap: 8px;
  }

  .export-btn {
    flex: 1;
    padding: 11px;
    border-radius: 12px;
    border: 1.5px solid ${BRAND.border};
    background: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: ${BRAND.green};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s;
  }

  .export-btn:hover {
    background: ${BRAND.greenPale};
    border-color: ${BRAND.green};
  }

  /* FILE INPUT (hidden) */
  input[type="file"] { display: none; }
`;

const CATEGORY_ICONS = {
  receita: "💰", consulta: "🩺", cirurgia: "⚕️", vacina: "💉",
  exame: "🔬", equipamento: "🔧", medicamento: "💊", insumo: "📦",
  aluguel: "🏠", funcionario: "👤", marketing: "📢", outro: "📌",
};

const QUICK_CHIPS = [
  "Recebi 500 de consulta",
  "Comprei luvas cirúrgicas por 80",
  "Paguei 2.300 de aluguel",
  "Recebi 1.200 de cirurgia",
  "Comprei medicamento 150",
];

export default function PetContabil() {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([{ role: "welcome" }]);
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInterim, setVoiceInterim] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldAutoSendRef = useRef(false);
  const fileInputRef = useRef(null);

  const totalReceitas = entries.filter(e => e.type === "receita").reduce((s, e) => s + e.amount, 0);
  const totalDespesas = entries.filter(e => e.type === "despesa").reduce((s, e) => s + e.amount, 0);
  const saldo = totalReceitas - totalDespesas;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const sr = getSpeechRecognition();
    if (!sr) return;
    setVoiceSupported(true);
    sr.lang = "pt-BR";
    sr.interimResults = true;
    sr.continuous = false;

    sr.onresult = (event) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) { setInput(final); setVoiceInterim(""); shouldAutoSendRef.current = true; }
      else setVoiceInterim(interim);
    };

    sr.onend = () => { setIsListening(false); setVoiceInterim(""); };
    sr.onerror = () => { setIsListening(false); setVoiceInterim(""); };
    recognitionRef.current = sr;
  }, []);

  useEffect(() => {
    if (shouldAutoSendRef.current && input) {
      shouldAutoSendRef.current = false;
      setTimeout(() => handleSend(), 100);
    }
  }, [input]);

  const callClaude = async (userText, imageBase64 = null) => {
    const systemPrompt = `Você é o assistente financeiro da Pet Contábil, especializado em contabilidade para veterinários.

Quando o usuário descrever uma transação (compra, recebimento, pagamento), extraia os dados e retorne JSON:
{
  "hasEntry": true,
  "entry": {
    "type": "receita" ou "despesa",
    "description": "descrição curta e clara",
    "amount": número,
    "category": uma de [receita, consulta, cirurgia, vacina, exame, equipamento, medicamento, insumo, aluguel, funcionario, marketing, outro],
    "date": "YYYY-MM-DD"
  },
  "reply": "mensagem amigável confirmando o registro, sem emojis"
}

Se não houver transação, retorne:
{
  "hasEntry": false,
  "reply": "resposta útil para o veterinário"
}

Use a data de hoje se não informada. Seja preciso e profissional. RETORNE APENAS JSON, sem markdown.`;

    const content = imageBase64
      ? [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: userText || "Registre os dados desse comprovante" }
        ]
      : [{ type: "text", text: userText }];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return { hasEntry: false, reply: text };
    }
  };

  const handleSend = useCallback(async (override = null) => {
    const text = override || input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await callClaude(text);
      const today = new Date().toISOString().split("T")[0];

      if (result.hasEntry && result.entry) {
        const entry = {
          id: Date.now(),
          ...result.entry,
          date: result.entry.date || today,
        };
        setEntries(prev => [entry, ...prev]);
        setMessages(prev => [...prev, { role: "assistant", text: result.reply, entry }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: result.reply || "Entendido!" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Erro ao processar. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];
      const userMsg = { role: "user", text: "📷 Foto enviada para análise" };
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);
      try {
        const result = await callClaude("", base64);
        const today = new Date().toISOString().split("T")[0];
        if (result.hasEntry && result.entry) {
          const entry = { id: Date.now(), ...result.entry, date: result.entry.date || today };
          setEntries(prev => [entry, ...prev]);
          setMessages(prev => [...prev, { role: "assistant", text: result.reply, entry }]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", text: result.reply }]);
        }
      } catch {
        setMessages(prev => [...prev, { role: "assistant", text: "Não consegui ler a foto. Tente novamente." }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); return; }
    try { recognitionRef.current.start(); setIsListening(true); } catch {}
  };

  const deleteEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const exportCSV = () => {
    const rows = [["Data", "Tipo", "Descrição", "Categoria", "Valor"]];
    entries.forEach(e => rows.push([
      formatDate(e.date), e.type === "receita" ? "Receita" : "Despesa",
      e.description, CATEGORIES[e.category]?.label || e.category,
      e.type === "despesa" ? -e.amount : e.amount,
    ]));
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pet-contabil.csv"; a.click();
  };

  // Category breakdown for Resumo
  const catBreakdown = Object.entries(
    entries.reduce((acc, e) => {
      const key = e.category;
      if (!acc[key]) acc[key] = { type: e.type, total: 0, label: CATEGORIES[key]?.label || key };
      acc[key].total += e.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1].total - a[1].total).slice(0, 8);

  const maxCat = catBreakdown.length ? Math.max(...catBreakdown.map(c => c[1].total)) : 1;

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        {/* HEADER */}
        <div className="header">
          <div className="header-top">
            <div className="logo-mark">
              <PawIcon size={20} color="white" />
            </div>
            <div className="logo-text">Pet<span>Contábil</span></div>
            <div className="balance-pill">
              <div className="balance-label">Saldo</div>
              <div className={`balance-value ${saldo < 0 ? "negative" : ""}`}>
                {formatCurrency(saldo)}
              </div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
              Chat
            </button>
            <button className={`tab ${tab === "planilha" ? "active" : ""}`} onClick={() => setTab("planilha")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h5v2h-5V6zm0 4h5v2h-5v-2zM5 6h3v12H5V6zm5 12v-2h5v2h-5zm0-4v-2h5v2h-5z"/>
              </svg>
              Planilha
              {entries.length > 0 && <span className="tab-badge">{entries.length}</span>}
            </button>
            <button className={`tab ${tab === "resumo" ? "active" : ""}`} onClick={() => setTab("resumo")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Resumo
            </button>
          </div>
        </div>

        {/* CHAT TAB */}
        {tab === "chat" && (
          <>
            <div className="content">
              <div className="chat-container">
                {messages.map((msg, i) => {
                  if (msg.role === "welcome") return (
                    <div key={i} className="welcome-card">
                      <p>Olá! Sou o assistente da <strong>Pet Contábil</strong>.</p>
                      <p>Me diga o que comprou, recebeu ou pagou — por texto, <strong>voz</strong> ou <strong>foto</strong> de nota/recibo — que eu organizo tudo!</p>
                      <p><em>Exemplo: "Recebi 800 de uma castração"</em></p>
                    </div>
                  );

                  if (msg.role === "user") return (
                    <div key={i} className="msg-row user">
                      <div className="msg-bubble">{msg.text}</div>
                    </div>
                  );

                  return (
                    <div key={i} className="msg-row assistant">
                      <div className="msg-avatar">
                        <PawIcon size={14} color="white" />
                      </div>
                      <div>
                        <div className="msg-bubble">
                          {msg.text}
                          {msg.entry && (
                            <div className="entry-card">
                              <div className="entry-card-header">
                                <span
                                  className="entry-cat-pill"
                                  style={{
                                    background: CATEGORIES[msg.entry.category]?.bg || BRAND.bg,
                                    color: CATEGORIES[msg.entry.category]?.color || BRAND.textMuted,
                                  }}
                                >
                                  {CATEGORY_ICONS[msg.entry.category] || "📌"}{" "}
                                  {CATEGORIES[msg.entry.category]?.label || msg.entry.category}
                                </span>
                                <span className={`entry-type-badge ${msg.entry.type}`}>
                                  {msg.entry.type === "receita" ? "↑ Receita" : "↓ Despesa"}
                                </span>
                              </div>
                              <div className="entry-desc">{msg.entry.description}</div>
                              <div className="entry-amount-row">
                                <span className={`entry-amount ${msg.entry.type}`}>
                                  {msg.entry.type === "despesa" ? "−" : "+"}{formatCurrency(msg.entry.amount)}
                                </span>
                                <span className="entry-date">{formatDate(msg.entry.date)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="msg-row assistant">
                    <div className="msg-avatar"><PawIcon size={14} color="white" /></div>
                    <div className="msg-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* QUICK CHIPS */}
            <div className="quick-chips">
              {QUICK_CHIPS.map((c, i) => (
                <button key={i} className="chip" onClick={() => handleSend(c)}>
                  {c}
                </button>
              ))}
            </div>

            {/* INPUT */}
            <div className="input-area">
              {voiceInterim && <div className="voice-interim">🎙 {voiceInterim}</div>}
              <div className="input-row">
                <button className="icon-btn btn-media" onClick={() => fileInputRef.current?.click()} title="Foto de nota">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} />

                <input
                  className="text-input"
                  placeholder="Diga o que aconteceu..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={loading}
                />

                {voiceSupported && (
                  <button
                    className={`icon-btn btn-voice ${isListening ? "recording" : ""}`}
                    onClick={toggleVoice}
                    title="Falar"
                  >
                    {isListening ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="2"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                      </svg>
                    )}
                  </button>
                )}

                <button
                  className="icon-btn btn-send"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* PLANILHA TAB */}
        {tab === "planilha" && (
          <div className="content">
            <div className="sheet-container">
              <div className="sheet-summary-row">
                <div className="sheet-stat-card">
                  <div className="sheet-stat-label">Receitas</div>
                  <div className="sheet-stat-value receita-color">{formatCurrency(totalReceitas)}</div>
                </div>
                <div className="sheet-stat-card">
                  <div className="sheet-stat-label">Despesas</div>
                  <div className="sheet-stat-value despesa-color">{formatCurrency(totalDespesas)}</div>
                </div>
                <div className="sheet-stat-card">
                  <div className="sheet-stat-label">Saldo</div>
                  <div className={`sheet-stat-value ${saldo >= 0 ? "saldo-pos" : "saldo-neg"}`}>
                    {formatCurrency(saldo)}
                  </div>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3>Nenhum lançamento ainda</h3>
                  <p>Use o chat para registrar receitas e despesas</p>
                </div>
              ) : (
                <div className="entries-list">
                  {entries.map(e => {
                    const cat = CATEGORIES[e.category] || CATEGORIES.outro;
                    return (
                      <div key={e.id} className="entry-row">
                        <div className="entry-icon-box" style={{ background: cat.bg }}>
                          {CATEGORY_ICONS[e.category] || "📌"}
                        </div>
                        <div className="entry-info">
                          <div className="entry-info-desc">{e.description}</div>
                          <div className="entry-info-meta">
                            <span className="entry-info-cat">{cat.label}</span>
                            <span>·</span>
                            <span>{formatDate(e.date)}</span>
                          </div>
                        </div>
                        <div className="entry-amount-col">
                          <div className={`amount ${e.type}`}>
                            {e.type === "despesa" ? "−" : "+"}{formatCurrency(e.amount)}
                          </div>
                        </div>
                        <button className="delete-btn" onClick={() => deleteEntry(e.id)} title="Excluir">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESUMO TAB */}
        {tab === "resumo" && (
          <div className="content">
            <div className="resumo-container">
              <div className="saldo-card">
                <div className="saldo-label">Saldo do Período</div>
                <div className={`saldo-main ${saldo < 0 ? "negative" : ""}`}>
                  {formatCurrency(saldo)}
                </div>
                <div className="saldo-sub">
                  <div className="saldo-sub-item">
                    <div className="saldo-sub-label">Receitas</div>
                    <div className="saldo-sub-val">+{formatCurrency(totalReceitas)}</div>
                  </div>
                  <div className="saldo-sub-item">
                    <div className="saldo-sub-label">Despesas</div>
                    <div className="saldo-sub-val">−{formatCurrency(totalDespesas)}</div>
                  </div>
                </div>
              </div>

              {catBreakdown.length > 0 && (
                <div>
                  <div className="section-title">Lançamentos por categoria</div>
                  {catBreakdown.map(([key, data]) => {
                    const cat = CATEGORIES[key] || CATEGORIES.outro;
                    return (
                      <div key={key} className="cat-bar-item">
                        <div className="cat-bar-header">
                          <span className="cat-bar-name">
                            {CATEGORY_ICONS[key] || "📌"} {cat.label}
                          </span>
                          <span className="cat-bar-amount">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="cat-bar-track">
                          <div
                            className="cat-bar-fill"
                            style={{
                              width: `${(data.total / maxCat) * 100}%`,
                              background: data.type === "receita" ? BRAND.green : BRAND.red,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {entries.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <h3>Nenhum dado ainda</h3>
                  <p>Registre transações no chat para ver o resumo</p>
                </div>
              )}

              {entries.length > 0 && (
                <div>
                  <div className="section-title">Exportar</div>
                  <div className="export-row">
                    <button className="export-btn" onClick={exportCSV}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                      Exportar CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
