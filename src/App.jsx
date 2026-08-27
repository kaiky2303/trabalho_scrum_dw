import { useEffect } from 'react';
import './App.css';
import Topbar from './components/TopBar';
import { 
  buildInitialData, 
  SEED_NAMES, 
  TEAM_IMAGES, 
  BUYER_IMAGES, 
  ROLE_COLORS 
} from './constants';
import {
  renderSetup, renderAlunos, renderEscalacao, renderSM,
  renderOwner, renderPO, renderDev, renderBuyerProf,
  renderBuyerProduct, renderCorrupSab, renderResult
} from './components/TabPanel';

const STORAGE_KEY = "@scrum_simulacao_data";

function loadInitialState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage:", e);
    }
  }
  return buildInitialData("Maverick Aviation", "SkyForge Ind. Aeronáutica");
}

function App() {
  let STATE = loadInitialState();
  let TAB = "setup";
  let FILE_NAME = localStorage.getItem(STORAGE_KEY) ? "(salvo automaticamente no navegador)" : "(nenhum arquivo carregado)";

  const TABS = [
    { key: "setup", label: "Configuração", fn: renderSetup },
    { key: "alunos", label: "Alunos", fn: renderAlunos },
    { key: "escalacao", label: "Escalação", fn: renderEscalacao },
    { key: "sm", label: "Scrum Master", fn: renderSM },
    { key: "owner", label: "Owner", fn: renderOwner },
    { key: "po", label: "Product Owner", fn: renderPO },
    { key: "dev", label: "Developers", fn: renderDev },
    { key: "buyerProf", label: "Compradores (Papel)", fn: renderBuyerProf },
    { key: "buyerProduct", label: "Compradores (Produto)", fn: renderBuyerProduct },
    { key: "corrupsab", label: "Corrupção & Sabotagem", fn: renderCorrupSab },
    { key: "result", label: "Resultado Final", fn: renderResult },
  ];

  function autoSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    } catch (err) {
      console.error("Falha ao salvar automaticamente no localStorage:", err);
    }
  }

  function setByPath(path, value) {
    const parts = path.split(".");
    let obj = STATE;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = value;
    autoSave();
  }

  function renderTabs() {
    const tabsEl = document.getElementById("tabsBar");
    if (tabsEl) {
      tabsEl.innerHTML = TABS.map(t => `<div class="tab ${TAB === t.key ? "active" : ""}" data-tab="${t.key}">${t.label}</div>`).join("");
    }
  }

  function renderPanel() {
    const wrap = document.getElementById("panelWrap");
    if (!wrap) return;
    const tabDef = TABS.find(t => t.key === TAB);
    wrap.innerHTML = tabDef.fn(STATE);
    attachRosterSearchHandler();
    attachImportHandler();
  }

  function fullRender() {
    renderTabs();
    renderPanel();
    const lbl = document.getElementById("fileNameLbl");
    if (lbl) lbl.textContent = FILE_NAME;
  }

  function handleFieldChange(target) {
    const path = target.getAttribute("data-path");
    const kind = target.getAttribute("data-kind");
    if (!path) return;
    let value = target.value;
    if (kind === "number" || kind === "number-rerender") value = parseFloat(value) || 0;
    if (kind === "check-rerender") value = target.checked;
    setByPath(path, value);
    if (kind === "check-rerender" || kind === "papel-rerender" || kind === "text-rerender" || kind === "number-rerender") {
      renderPanel();
    }
  }

  function renameEmpresa(which, novoNome) {
    const oldA = STATE.meta.empresaA, oldB = STATE.meta.empresaB;
    const oldVal = which === "nomeA" ? oldA : oldB;
    if (!novoNome || novoNome === oldVal) return;
    const rename = (v) => (v === oldVal ? novoNome : v);
    STATE.sm.forEach(r => r.empresa = rename(r.empresa));
    STATE.owner.forEach(r => r.empresa = rename(r.empresa));
    STATE.po.forEach(r => r.empresa = rename(r.empresa));
    STATE.dev.forEach(r => r.empresa = rename(r.empresa));
    STATE.buyerProduct.forEach(r => r.empresa = rename(r.empresa));
    STATE.alunos.forEach(a => a.empresa = rename(a.empresa));
    STATE.corrupcao.empresaCorruptora = rename(STATE.corrupcao.empresaCorruptora);
    STATE.sabotagem.empresaSabotador = rename(STATE.sabotagem.empresaSabotador);
    if (STATE.teamNames[oldVal]) { STATE.teamNames[novoNome] = STATE.teamNames[oldVal]; delete STATE.teamNames[oldVal]; }
    if (which === "nomeA") STATE.meta.empresaA = novoNome; else STATE.meta.empresaB = novoNome;
    autoSave();
    renderPanel();
  }

  function attachDelegatedEvents() {
    const wrap = document.getElementById("panelWrap");
    if (!wrap) return;
    wrap.addEventListener("change", (e) => {
      if (e.target.id === "nomeA" || e.target.id === "nomeB") { renameEmpresa(e.target.id, e.target.value); return; }
      if (e.target.matches("select, input[type=checkbox]")) handleFieldChange(e.target);
    });
    wrap.addEventListener("input", (e) => {
      if (e.target.matches("input[type=text]") && e.target.getAttribute("data-kind") === "text") {
        setByPath(e.target.getAttribute("data-path"), e.target.value);
      }
    });
  }

  function attachRosterSearchHandler() {
    const input = document.getElementById("alunoSearch");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll("#alunosBody tr").forEach(tr => {
        const name = tr.children[1].textContent.toLowerCase();
        tr.style.display = name.includes(q) ? "" : "none";
      });
    });
  }

  function attachImportHandler() {
    const input = document.getElementById("importAlunosFile");
    if (!input) return;
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = window.XLSX.read(ev.target.result, { type: "array" });
          const names = [];
          wb.SheetNames.forEach(sn => {
            const ws = wb.Sheets[sn];
            const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
            rows.forEach(row => {
              row.forEach(cell => {
                if (typeof cell === "string" && cell.trim().split(" ").length >= 2 && cell.trim().length > 5 && !/\d/.test(cell)) {
                  names.push(cell.trim());
                }
              });
            });
          });
          const unique = Array.from(new Set(names));
          if (unique.length === 0) { alert("Não encontrei nomes reconhecíveis nesse arquivo."); return; }
          if (!window.confirm(`Encontrei ${unique.length} nomes. Isso substitui a lista atual de alunos (as atribuições feitas serão perdidas). Continuar?`)) return;
          STATE.alunos = unique.map((nome, i) => ({ id: i + 1, nome, empresa: "", time: "", papel: "" }));
          autoSave();
          renderPanel();
        } catch (err) {
          alert("Não foi possível ler este arquivo Excel.");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function applyFontScale() {
    document.documentElement.style.fontSize = STATE.meta.fontScale + "px";
  }

  function changeFontScale(delta) {
    STATE.meta.fontScale = Math.max(12, Math.min(24, STATE.meta.fontScale + delta));
    applyFontScale();
    autoSave();
    const lbl = document.getElementById("fontLbl");
    if (lbl) lbl.textContent = STATE.meta.fontScale + "px";
  }

  function handleSave() {
    const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTurma = (STATE.meta.turma || "simulacao").replace(/[^a-z0-9A-Z_-]+/g, "_");
    a.href = url; a.download = `scrum_simulacao_${safeTurma}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleLoadFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        STATE = parsed;
        if (!STATE.meta.fontScale) STATE.meta.fontScale = 16;
        if (!STATE.alunos) STATE.alunos = SEED_NAMES.map((nome, i) => ({ id: i + 1, nome, empresa: "", time: "", papel: "" }));
        if (!STATE.teamNames) {
          STATE.teamNames = {
            [STATE.meta.empresaA]: { Caça: "Esquadrão Falcon", Transporte: "Falcon Carggo" },
            [STATE.meta.empresaB]: { Caça: "SkyForge Combat", Transporte: "SkyForge Transport" },
          };
        }
        FILE_NAME = file.name;
        autoSave();
        applyFontScale();
        const fontLbl = document.getElementById("fontLbl");
        if (fontLbl) fontLbl.textContent = STATE.meta.fontScale + "px";
        fullRender();
      } catch (err) {
        alert("Não foi possível ler este arquivo. Verifique se é um .json válido gerado por este painel.");
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (window.confirm("Isso apaga todos os dados lançados nesta sessão (não afeta arquivos já salvos). Continuar?")) {
      localStorage.removeItem(STORAGE_KEY);
      STATE = buildInitialData("Maverick Aviation", "SkyForge Ind. Aeronáutica");
      FILE_NAME = "(nenhum arquivo carregado)";
      applyFontScale();
      const fontLbl = document.getElementById("fontLbl");
      if (fontLbl) fontLbl.textContent = STATE.meta.fontScale + "px";
      fullRender();
    }
  }

  useEffect(() => {
    const tabsBar = document.getElementById("tabsBar");
    if (tabsBar) {
      tabsBar.addEventListener("click", (e) => {
        const t = e.target.closest(".tab");
        if (!t) return;
        TAB = t.getAttribute("data-tab");
        fullRender();
      });
    }

    const btnSave = document.getElementById("btnSave");
    if (btnSave) btnSave.addEventListener("click", handleSave);

    const btnLoad = document.getElementById("btnLoad");
    if (btnLoad) btnLoad.addEventListener("click", () => document.getElementById("fileInput").click());

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files[0]) handleLoadFile(e.target.files[0]);
        e.target.value = "";
      });
    }

    const btnReset = document.getElementById("btnReset");
    if (btnReset) btnReset.addEventListener("click", handleReset);

    const fontMinus = document.getElementById("fontMinus");
    if (fontMinus) fontMinus.addEventListener("click", () => changeFontScale(-1));

    const fontPlus = document.getElementById("fontPlus");
    if (fontPlus) fontPlus.addEventListener("click", () => changeFontScale(1));

    const fontReset = document.getElementById("fontReset");
    if (fontReset) {
      fontReset.addEventListener("click", () => {
        STATE.meta.fontScale = 16;
        applyFontScale();
        autoSave();
        const fontLbl = document.getElementById("fontLbl");
        if (fontLbl) fontLbl.textContent = "16px";
      });
    }

    attachDelegatedEvents();
    applyFontScale();
    fullRender();
  }, []);

  return (
    <div className="app-root">
      <Topbar />
      <div className="tabs" id="tabsBar"></div>
      <div className="wrap">
        <div id="panelWrap"></div>
        <div className="footer-note">
          Salvamento automático ativado. As alterações são gravadas no navegador e persistem ao recarregar a página.
        </div>
      </div>
    </div>
  );
}

export default App;