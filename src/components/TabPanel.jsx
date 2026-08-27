import { SPRINTS, TIMES, BUYERS, PAPEIS, TEAM_IMAGES, BUYER_IMAGES, ROLE_COLORS } from '../constants';
import { computeCorrupcaoPontos, computeSabotagemPontos, computeEmpresaScore } from '../scoring';

function esc(s) { return (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function snSelectHtml(value, path) {
  return `<select data-path="${path}" data-kind="sn">
  <option value="" ${value === "" ? "selected" : ""}>—</option>
  <option value="S" ${value === "S" ? "selected" : ""}>Sim</option>
  <option value="N" ${value === "N" ? "selected" : ""}>Não</option>
</select>`;
}

function scoreSelectHtml(value, path) {
  let opts = `<option value="" ${value === "" ? "selected" : ""}>—</option>`;
  for (let n = 1; n <= 5; n++) opts += `<option value="${n}" ${String(value) === String(n) ? "selected" : ""}>${n}</option>`;
  return `<select data-path="${path}" data-kind="score">${opts}</select>`;
}

function decisaoSelectHtml(value, path) {
  const opts = [["", "—"], ["A", "Aceitou"], ["I", "Ignorou"], ["D", "Denunciou"]];
  return `<select data-path="${path}" data-kind="decisao">` +
    opts.map(([v, l]) => `<option value="${v}" ${value === v ? "selected" : ""}>${l}</option>`).join("") + `</select>`;
}

function obsInputHtml(value, path, placeholder) {
  return `<input class="obs-input" type="text" data-path="${path}" data-kind="text" value="${esc(value)}" placeholder="${esc(placeholder || "")}" />`;
}

function sprintCellLabel(rows, i, key) {
  if (i === 0) return "Sprint " + rows[i].sprint;
  return rows[i][key] !== rows[i - 1][key] ? "Sprint " + rows[i].sprint : "";
}

function papelBadgeColor(papel) { return ROLE_COLORS[papel] || "#6E6E6E"; }

export function renderSetup(STATE) {
  const m = STATE.meta;
  const weightLabels = { sm: "Scrum Master", owner: "Owner", po: "Product Owner", dev: "Developers", buyer: "Avaliação dos Compradores" };
  return `
<div class="panel">
  <h2>Configuração</h2>
  <div class="desc">Identificação da turma e nomes das empresas/times. Alterar os nomes atualiza todas as abas automaticamente.</div>
  <div class="fields-row">
    <div class="field"><label>Turma</label><input type="text" data-path="meta.turma" data-kind="text" value="${esc(m.turma)}" /></div>
    <div class="field"><label>Data</label><input type="text" data-path="meta.data" data-kind="text" value="${esc(m.data)}" /></div>
  </div>
  <div class="fields-row">
    <div class="field"><label>Nome — Empresa A</label><input type="text" id="nomeA" data-kind="renameA" value="${esc(m.empresaA)}" /></div>
    <div class="field"><label>Time Caça — Empresa A</label><input type="text" data-path="teamNames.${esc(m.empresaA)}.Caça" data-kind="text" value="${esc(STATE.teamNames[m.empresaA].Caça)}" /></div>
    <div class="field"><label>Time Transporte — Empresa A</label><input type="text" data-path="teamNames.${esc(m.empresaA)}.Transporte" data-kind="text" value="${esc(STATE.teamNames[m.empresaA].Transporte)}" /></div>
  </div>
  <div class="fields-row">
    <div class="field"><label>Nome — Empresa B</label><input type="text" id="nomeB" data-kind="renameB" value="${esc(m.empresaB)}" /></div>
    <div class="field"><label>Time Caça — Empresa B</label><input type="text" data-path="teamNames.${esc(m.empresaB)}.Caça" data-kind="text" value="${esc(STATE.teamNames[m.empresaB].Caça)}" /></div>
    <div class="field"><label>Time Transporte — Empresa B</label><input type="text" data-path="teamNames.${esc(m.empresaB)}.Transporte" data-kind="text" value="${esc(STATE.teamNames[m.empresaB].Transporte)}" /></div>
  </div>
  <div class="note note-dark">Dica: os nomes de empresa já vêm pré-preenchidos a partir das imagens que você enviou (Maverick Aviation e SkyForge Ind. Aeronáutica). Pode alterar se quiser.</div>

  <h2 style="margin-top:1.6rem">Pesos da Nota Final</h2>
  <div class="desc">Ajuste o peso de cada papel no cálculo da nota final da empresa (aba "Resultado Final").</div>
  <div class="weights-panel">
    ${Object.keys(STATE.weights).map(k => `
      <div class="weight-field">
        <label>${weightLabels[k]}</label>
        <input type="number" min="0" step="0.5" data-path="weights.${k}" data-kind="number" value="${STATE.weights[k]}" />
      </div>`).join("")}
  </div>
</div>`;
}

export function renderSM(STATE) {
  const rows = STATE.sm;
  return `<div class="panel">
  <h2>Scrum Master</h2>
  <div class="desc">Avaliação de processo — um Scrum Master por empresa, atendendo os dois times.</div>
  <table><thead><tr>
    <th>Sprint</th><th>Empresa</th><th>Conduziu os eventos<br>corretamente?</th>
    <th>Removeu<br>impedimentos?</th><th>Ajudou o time a<br>melhorar entre Sprints?</th>
    <th>Nota (1-5)</th><th>Observações</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td class="sprint-label">${esc(sprintCellLabel(rows, i, "sprint"))}</td>
      <td>${esc(r.empresa)}</td>
      <td>${snSelectHtml(r.conduziu, `sm.${i}.conduziu`)}</td>
      <td>${snSelectHtml(r.removeu, `sm.${i}.removeu`)}</td>
      <td>${snSelectHtml(r.ajudou, `sm.${i}.ajudou`)}</td>
      <td>${scoreSelectHtml(r.nota, `sm.${i}.nota`)}</td>
      <td>${obsInputHtml(r.obs, `sm.${i}.obs`)}</td>
    </tr>`).join("")}
  </tbody></table>
  <div class="note note-dark">Critério-guia: o SM não é avaliado por produzir, mas por garantir que o Scrum aconteça de verdade e por ajudar o time a evoluir de uma Sprint para a outra.</div>
</div>`;
}

export function renderOwner(STATE) {
  const rows = STATE.owner;
  return `<div class="panel">
  <h2>Stakeholder / Owner</h2>
  <div class="desc">Avaliação de comunicação e negociação — independente dos pontos de corrupção, registrados na aba "Corrupção &amp; Sabotagem".</div>
  <table><thead><tr>
    <th>Sprint</th><th>Empresa</th><th>Comunicação com<br>a equipe (1-5)</th>
    <th>Negociação com<br>compradores (1-5)</th><th>Alinhamento com<br>SM/PO sobre qualidade (1-5)</th>
    <th>Nota Geral (1-5)</th><th>Observações</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td class="sprint-label">${esc(sprintCellLabel(rows, i, "sprint"))}</td>
      <td>${esc(r.empresa)}</td>
      <td>${scoreSelectHtml(r.comunicacao, `owner.${i}.comunicacao`)}</td>
      <td>${scoreSelectHtml(r.negociacao, `owner.${i}.negociacao`)}</td>
      <td>${scoreSelectHtml(r.alinhamento, `owner.${i}.alinhamento`)}</td>
      <td>${scoreSelectHtml(r.notaGeral, `owner.${i}.notaGeral`)}</td>
      <td>${obsInputHtml(r.obs, `owner.${i}.obs`)}</td>
    </tr>`).join("")}
  </tbody></table>
  <div class="note note-blue">Esta nota avalia o desempenho no papel — não confunda com os pontos ganhos/perdidos no mecanismo de corrupção, calculados automaticamente na aba própria.</div>
</div>`;
}

export function renderPO(STATE) {
  const rows = STATE.po;
  return `<div class="panel">
  <h2>Product Owner</h2>
  <div class="desc">Um Product Owner por time (2 times por empresa).</div>
  <table><thead><tr>
    <th>Sprint</th><th>Empresa</th><th>Time</th><th>Requisitos<br>claros ao time?</th>
    <th>Acompanhou os<br>testes de perto?</th><th>Reunião de<br>priorização ocorreu?</th>
    <th>Nota (1-5)</th><th>Observações</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td class="sprint-label">${esc(sprintCellLabel(rows, i, "sprint"))}</td>
      <td>${esc(r.empresa)}</td><td>${esc(r.time)}</td>
      <td>${snSelectHtml(r.requisitos, `po.${i}.requisitos`)}</td>
      <td>${snSelectHtml(r.testes, `po.${i}.testes`)}</td>
      <td>${snSelectHtml(r.reuniao, `po.${i}.reuniao`)}</td>
      <td>${scoreSelectHtml(r.nota, `po.${i}.nota`)}</td>
      <td>${obsInputHtml(r.obs, `po.${i}.obs`)}</td>
    </tr>`).join("")}
  </tbody></table>
  <div class="note note-teal">Critério-guia: o PO é avaliado pela clareza dos requisitos e pelo acompanhamento ativo da produção — não pela qualidade técnica do avião em si.</div>
</div>`;
}

export function renderDev(STATE) {
  const rows = STATE.dev;
  return `<div class="panel">
  <h2>Developers</h2>
  <div class="desc">Avaliação por time — com muitos alunos em produção, a qualidade do produto é o principal indicador de entendimento do processo pelo grupo.</div>
  <table><thead><tr>
    <th>Sprint</th><th>Empresa</th><th>Time</th><th>Qualidade do<br>produto (1-5)</th>
    <th>Seguiu o<br>processo?</th><th>Colaboração<br>do time (1-5)</th>
    <th>Nota Time (1-5)</th><th>Destaque individual (opcional)</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td class="sprint-label">${esc(sprintCellLabel(rows, i, "sprint"))}</td>
      <td>${esc(r.empresa)}</td><td>${esc(r.time)}</td>
      <td>${scoreSelectHtml(r.qualidade, `dev.${i}.qualidade`)}</td>
      <td>${snSelectHtml(r.processo, `dev.${i}.processo`)}</td>
      <td>${scoreSelectHtml(r.colaboracao, `dev.${i}.colaboracao`)}</td>
      <td>${scoreSelectHtml(r.notaTime, `dev.${i}.notaTime`)}</td>
      <td>${obsInputHtml(r.destaque, `dev.${i}.destaque`, "nome (se houver)")}</td>
    </tr>`).join("")}
  </tbody></table>
  <div class="note note-green">Reserve a coluna de destaque individual apenas para casos que realmente chamem atenção, positiva ou negativamente.</div>
</div>`;
}

export function renderBuyerProf(STATE) {
  const rows = STATE.buyerProf;
  return `<div class="panel">
  <h2>Compradores — Desempenho no Papel</h2>
  <div class="desc">Avaliação do professor sobre como cada comprador exerceu seu papel.</div>
  <table><thead><tr>
    <th>Sprint</th><th>Comprador</th><th>Aplicou o checklist<br>de verificação?</th>
    <th>Decisões coerentes<br>com o papel?</th><th>Feedback construtivo<br>nas Reviews?</th>
    <th>Nota (1-5)</th><th>Observações</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td class="sprint-label">${esc(sprintCellLabel(rows, i, "sprint"))}</td>
      <td>${esc(r.comprador)}</td>
      <td>${snSelectHtml(r.checklist, `buyerProf.${i}.checklist`)}</td>
      <td>${snSelectHtml(r.decisoes, `buyerProf.${i}.decisoes`)}</td>
      <td>${snSelectHtml(r.feedback, `buyerProf.${i}.feedback`)}</td>
      <td>${scoreSelectHtml(r.nota, `buyerProf.${i}.nota`)}</td>
      <td>${obsInputHtml(r.obs, `buyerProf.${i}.obs`)}</td>
    </tr>`).join("")}
  </tbody></table>
  <div class="note note-orange">Critério-guia: avalie se o comprador aplicou o checklist a cada Sprint, se as decisões foram coerentes com o papel, e se o feedback nas Reviews foi útil.</div>
</div>`;
}

export function renderBuyerProduct(STATE) {
  const rows = STATE.buyerProduct;
  return `<div class="panel">
  <h2>Ficha do Comprador — Avaliação do Produto</h2>
  <div class="desc">Transcreva aqui os dados que cada comprador preencheu na ficha em papel, ao final de cada Sprint.</div>
  <table><thead><tr>
    <th>Sprint</th><th>Comprador</th><th>Empresa</th><th>Produto</th>
    <th>Padrão<br>Técnico</th><th>Padrão<br>Visual</th><th>Prazo</th>
    <th>Com.<br>Owner (1-5)</th><th>Sinal</th><th>Decisão</th><th>Nota (1-5)</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr>
      <td class="sprint-label">${esc(sprintCellLabel(rows, i, "sprint"))}</td>
      <td>${esc(r.comprador)}</td><td>${esc(r.empresa)}</td><td>${esc(r.produto)}</td>
      <td>${snSelectHtml(r.pt, `buyerProduct.${i}.pt`)}</td>
      <td>${snSelectHtml(r.pv, `buyerProduct.${i}.pv`)}</td>
      <td>${snSelectHtml(r.prazo, `buyerProduct.${i}.prazo`)}</td>
      <td>${scoreSelectHtml(r.comOwner, `buyerProduct.${i}.comOwner`)}</td>
      <td>${snSelectHtml(r.sinal, `buyerProduct.${i}.sinal`)}</td>
      <td>${decisaoSelectHtml(r.decisao, `buyerProduct.${i}.decisao`)}</td>
      <td>${scoreSelectHtml(r.nota, `buyerProduct.${i}.nota`)}</td>
    </tr>`).join("")}
  </tbody></table>
  <div class="note note-orange">Militar só avalia Caça; Setor Privado só avalia Transporte; Governo avalia os dois. Linhas fora do papel do comprador podem ficar em branco.</div>
</div>`;
}

export function renderCorrupSab(STATE) {
  const c = STATE.corrupcao, s = STATE.sabotagem;
  const cPts = computeCorrupcaoPontos(c);
  const sPts = computeSabotagemPontos(s);
  const empresaOpts = (sel) => [STATE.meta.empresaA, STATE.meta.empresaB].map(e => `<option value="${esc(e)}" ${sel === e ? "selected" : ""}>${esc(e)}</option>`).join("");
  const compradorOpts = (sel) => BUYERS.filter(b => b !== "Militar").map(b => `<option value="${esc(b)}" ${sel === b ? "selected" : ""}>${esc(b)}</option>`).join("");
  return `<div class="panel">
  <h2>Corrupção &amp; Sabotagem</h2>
  <div class="desc">Estes dois mecanismos são baseados em regras fixas — os pontos abaixo são calculados automaticamente.</div>
  <div class="grid2">
    <div class="mini-card">
      <h3>🔒 Corruptor (Owner)</h3>
      <div class="mini-row"><label>Empresa do corruptor</label>
        <select data-path="corrupcao.empresaCorruptora" data-kind="text-rerender">${empresaOpts(c.empresaCorruptora)}</select></div>
      <div class="checkbox-row" style="margin-bottom:0.6rem">
        <input type="checkbox" id="cd1" data-path="corrupcao.primeiraDescoberta" data-kind="check-rerender" ${c.primeiraDescoberta ? "checked" : ""} />
        <label for="cd1">1ª descoberta ocorreu</label></div>
      ${c.primeiraDescoberta ? `<div class="mini-row"><label>Comprador que aceitou (1ª vez)</label>
        <select data-path="corrupcao.primeiroComprador" data-kind="text-rerender"><option value="">—</option>${compradorOpts(c.primeiroComprador)}</select></div>` : ""}
      <div class="checkbox-row" style="margin-bottom:0.6rem">
        <input type="checkbox" id="cd2" data-path="corrupcao.segundaDescoberta" data-kind="check-rerender" ${c.segundaDescoberta ? "checked" : ""} ${!c.primeiraDescoberta ? "disabled" : ""} />
        <label for="cd2">2ª descoberta ocorreu (mesmo assim)</label></div>
      ${c.segundaDescoberta ? `<div class="mini-row"><label>Comprador que aceitou (2ª vez)</label>
        <select data-path="corrupcao.segundoComprador" data-kind="text-rerender"><option value="">—</option>${compradorOpts(c.segundoComprador)}</select></div>` : ""}
      <div class="mini-row" style="border-top:1px solid var(--line);padding-top:0.6rem;margin-top:0.4rem">
        <label><strong>Pontos do corruptor</strong></label><span class="pts ${cPts.corruptor < 0 ? "neg" : ""}">${cPts.corruptor.toFixed(1)}</span></div>
      ${Object.keys(cPts.compradores).map(b => `<div class="mini-row"><label>Pontos — ${esc(b)}</label><span class="pts ${cPts.compradores[b] < 0 ? "neg" : ""}">${cPts.compradores[b].toFixed(1)}</span></div>`).join("")}
      <div class="note note-red" style="margin-top:0.8rem">O corruptor nunca troca de papel e continua negociando normalmente, mesmo após ser descoberto.</div>
    </div>
    <div class="mini-card">
      <h3>🔒 Sabotador (Developer)</h3>
      <div class="mini-row"><label>Empresa do sabotador</label>
        <select data-path="sabotagem.empresaSabotador" data-kind="text-rerender">${empresaOpts(s.empresaSabotador)}</select></div>
      <div class="mini-row"><label>Time do sabotador</label>
        <select data-path="sabotagem.timeSabotador" data-kind="text-rerender">${TIMES.map(t => `<option value="${t}" ${s.timeSabotador === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div class="mini-row"><label>Tipo de ação</label>
        <select data-path="sabotagem.tipoAcao" data-kind="text-rerender">
          <option value="vazar" ${s.tipoAcao === "vazar" ? "selected" : ""}>Vazar informação</option>
          <option value="atrapalhar" ${s.tipoAcao === "atrapalhar" ? "selected" : ""}>Atrapalhar decisões/produção</option>
        </select></div>
      <div class="checkbox-row" style="margin-bottom:0.6rem">
        <input type="checkbox" id="sd1" data-path="sabotagem.descoberto" data-kind="check-rerender" ${s.descoberto ? "checked" : ""} />
        <label for="sd1">Sabotador foi descoberto</label></div>
      ${s.descoberto ? `
      <div class="mini-row"><label>Denúncias consecutivas recebidas</label>
        <select data-path="sabotagem.denunciasConsecutivas" data-kind="number-rerender">
          <option value="0" ${s.denunciasConsecutivas === 0 ? "selected" : ""}>0</option>
          <option value="1" ${s.denunciasConsecutivas === 1 ? "selected" : ""}>1</option>
          <option value="2" ${s.denunciasConsecutivas === 2 ? "selected" : ""}>2</option>
        </select></div>
      <div class="checkbox-row" style="margin-bottom:0.6rem">
        <input type="checkbox" id="sd2" data-path="sabotagem.areaSoubeECalou" data-kind="check-rerender" ${s.areaSoubeECalou ? "checked" : ""} />
        <label for="sd2">PO/colegas da área sabiam e ficaram calados</label></div>` : ""}
      <div class="mini-row" style="border-top:1px solid var(--line);padding-top:0.6rem;margin-top:0.4rem">
        <label><strong>Pontos do sabotador</strong></label><span class="pts ${sPts.sabotador < 0 ? "neg" : ""}">${sPts.sabotador.toFixed(1)}</span></div>
      <div class="mini-row"><label><strong>Pontos da área/time</strong></label><span class="pts ${sPts.area < 0 ? "neg" : sPts.area > 0 ? "pos" : ""}">${sPts.area > 0 ? "+" : ""}${sPts.area.toFixed(1)}</span></div>
      <div class="mini-row"><label><strong>Demitido?</strong></label><span class="pts">${sPts.demitido ? "SIM — vai para o time RIVAL" : "Não"}</span></div>
    </div>
  </div>
</div>`;
}

export function renderResult(STATE) {
  const empresas = [STATE.meta.empresaA, STATE.meta.empresaB];
  const colors = ["linear-gradient(135deg, #455F51, #324339)", "linear-gradient(135deg, #0989B1, #065E77)"];
  const scores = empresas.map(e => Object.assign({ empresa: e }, computeEmpresaScore(STATE, e)));
  return `<div class="panel">
  <h2>Resultado Final</h2>
  <div class="desc">Cálculo automático a partir das médias lançadas em cada aba, ajustado pelos pontos de corrupção/sabotagem. Use como referência — a decisão final da nota é sempre sua.</div>
  <div class="grid2">
    ${scores.map((s, i) => `
    <div class="dash-card" style="background:${colors[i]}">
      <h3>${esc(s.empresa)}</h3>
      <div class="big">${s.final !== null ? s.final.toFixed(2) : "—"}</div>
      <div class="breakdown">
        ${s.parts.map(p => `<div><span>${esc(p.key)}</span><span>${p.val !== null ? p.val.toFixed(2) : "—"}</span></div>`).join("")}
        <div style="margin-top:0.4rem;border-top:1px solid rgba(255,255,255,.3);padding-top:0.4rem">
          <span>Ajuste (corrupção/sabotagem)</span><span>${s.ajuste >= 0 ? "+" : ""}${s.ajuste.toFixed(1)}</span>
        </div>
      </div>
    </div>`).join("")}
  </div>
  <div class="note note-orange" style="margin-top:1.1rem">A nota final é uma média ponderada das notas médias por papel (pesos configuráveis em "Configuração"), somada aos pontos fixos de corrupção/sabotagem. Ela não substitui seu julgamento.</div>
</div>`;
}

export function renderAlunos(STATE) {
  const empresas = [STATE.meta.empresaA, STATE.meta.empresaB];
  const counts = {};
  empresas.forEach(e => { counts[e] = { "Scrum Master": 0, "Owner/Stakeholder": 0, "Product Owner-Caça": 0, "Product Owner-Transporte": 0, "Developer-Caça": 0, "Developer-Transporte": 0 }; });
  const buyerCounts = { "Comprador - Governo": 0, "Comprador - Militar": 0, "Comprador - Setor Privado": 0 };
  STATE.alunos.forEach(a => {
    if (a.papel === "Comprador - Governo" || a.papel === "Comprador - Militar" || a.papel === "Comprador - Setor Privado") {
      buyerCounts[a.papel]++;
    } else if (a.papel === "Scrum Master" || a.papel === "Owner/Stakeholder") {
      if (counts[a.empresa]) counts[a.empresa][a.papel]++;
    } else if (a.papel === "Product Owner" || a.papel === "Developer") {
      if (counts[a.empresa] && a.time) counts[a.empresa][a.papel + "-" + a.time]++;
    }
  });
  const naoAtribuidos = STATE.alunos.filter(a => !a.papel).length;

  return `<div class="panel">
  <h2>Alunos</h2>
  <div class="desc">Atribua cada aluno a um papel e equipe. A turma não escolhe o lado — a atribuição é feita aqui pelo professor.</div>
  <div class="roster-search"><input type="text" id="alunoSearch" placeholder="Buscar aluno por nome..." /></div>
  <table class="roster-table"><thead><tr>
    <th style="width:2.5rem">#</th><th style="width:16rem">Nome</th><th>Papel</th><th>Empresa</th><th>Time</th></tr></thead>
    <tbody id="alunosBody">
    ${STATE.alunos.map((a, i) => renderAlunoRow(STATE, a, i)).join("")}
    </tbody></table>
  <div class="note ${naoAtribuidos > 0 ? "note-orange" : "note-green"}" style="margin-top:1rem">
    ${naoAtribuidos} de ${STATE.alunos.length} alunos ainda sem papel atribuído.
  </div>

  <h2 style="margin-top:1.6rem">Resumo de Vagas Preenchidas</h2>
  <div class="grid2">
    ${empresas.map(e => `
      <div class="mini-card">
        <h3>${esc(e)}</h3>
        <div class="mini-row"><label>Scrum Master</label><span class="pts">${counts[e]["Scrum Master"]} / 1</span></div>
        <div class="mini-row"><label>Owner/Stakeholder</label><span class="pts">${counts[e]["Owner/Stakeholder"]} / 1</span></div>
        <div class="mini-row"><label>PO — ${esc(STATE.teamNames[e].Caça)}</label><span class="pts">${counts[e]["Product Owner-Caça"]} / 1</span></div>
        <div class="mini-row"><label>PO — ${esc(STATE.teamNames[e].Transporte)}</label><span class="pts">${counts[e]["Product Owner-Transporte"]} / 1</span></div>
        <div class="mini-row"><label>Devs — ${esc(STATE.teamNames[e].Caça)}</label><span class="pts">${counts[e]["Developer-Caça"]} / 4</span></div>
        <div class="mini-row"><label>Devs — ${esc(STATE.teamNames[e].Transporte)}</label><span class="pts">${counts[e]["Developer-Transporte"]} / 5</span></div>
      </div>`).join("")}
  </div>
  <div class="mini-card" style="margin-top:1rem">
    <h3>Compradores</h3>
    <div class="mini-row"><label>Governo</label><span class="pts">${buyerCounts["Comprador - Governo"]} / 1</span></div>
    <div class="mini-row"><label>Militar</label><span class="pts">${buyerCounts["Comprador - Militar"]} / 1</span></div>
    <div class="mini-row"><label>Setor Privado</label><span class="pts">${buyerCounts["Comprador - Setor Privado"]} / 1</span></div>
  </div>

  <h2 style="margin-top:1.6rem">Importar Lista de Alunos</h2>
  <div class="desc">Substitui a lista atual por uma nova, a partir de um arquivo Excel (.xlsx). Use apenas se for reaproveitar este painel para outra turma.</div>
  <input type="file" id="importAlunosFile" accept=".xlsx,.xls" />
</div>`;
}

function renderAlunoRow(STATE, a, i) {
  const empresas = [STATE.meta.empresaA, STATE.meta.empresaB];
  const needsEmpresa = a.papel === "Scrum Master" || a.papel === "Owner/Stakeholder" || a.papel === "Product Owner" || a.papel === "Developer";
  const needsTime = a.papel === "Product Owner" || a.papel === "Developer";
  return `<tr data-aluno-row="${i}">
  <td>${a.id}</td>
  <td style="text-align:left">${esc(a.nome)}</td>
  <td><select data-path="alunos.${i}.papel" data-kind="papel-rerender">
    ${PAPEIS.map(p => `<option value="${esc(p)}" ${a.papel === p ? "selected" : ""}>${p === "" ? "— não atribuído —" : esc(p)}</option>`).join("")}
    </select></td>
  <td>${needsEmpresa ? `<select data-path="alunos.${i}.empresa" data-kind="text-rerender">
      <option value="">—</option>${empresas.map(e => `<option value="${esc(e)}" ${a.empresa === e ? "selected" : ""}>${esc(e)}</option>`).join("")}
    </select>` : ""}</td>
  <td>${needsTime ? `<select data-path="alunos.${i}.time" data-kind="text-rerender">
      <option value="">—</option>${TIMES.map(t => `<option value="${t}" ${a.time === t ? "selected" : ""}>${t}</option>`).join("")}
    </select>` : ""}</td>
</tr>`;
}

export function renderEscalacao(STATE) {
  const empresas = [STATE.meta.empresaA, STATE.meta.empresaB];
  return `<div class="panel">
  <h2>Escalação</h2>
  <div class="desc">Visão de equipe, com a identidade visual de cada empresa — útil para projetar em sala.</div>
  ${empresas.map(e => renderCompanyBlock(STATE, e)).join("")}

  <h2 style="margin-top:0.4rem">Compradores</h2>
  <div class="buyers-strip">
    ${BUYERS.map(b => {
    const aluno = STATE.alunos.find(a => a.papel === "Comprador - " + b);
    return `<div class="buyer-card">
        <img src="${BUYER_IMAGES[b]}" alt="${esc(b)}" />
        <div class="buyer-body">
          <h3>${esc(b)}</h3>
          <div>${aluno ? esc(aluno.nome) : '<span class="tag-unassigned">não atribuído</span>'}</div>
        </div>
      </div>`;
  }).join("")}
  </div>
</div>`;
}

function renderCompanyBlock(STATE, empresa) {
  const imgs = TEAM_IMAGES[empresa] || {};
  const sm = STATE.alunos.find(a => a.papel === "Scrum Master" && a.empresa === empresa);
  const owner = STATE.alunos.find(a => a.papel === "Owner/Stakeholder" && a.empresa === empresa);
  const teamRoster = (time) => STATE.alunos.filter(a => a.empresa === empresa && a.time === time && (a.papel === "Product Owner" || a.papel === "Developer"));
  return `<div class="company-block">
  <div class="company-header">
    <img src="${imgs.logo || ""}" alt="${esc(empresa)}" />
    <div><h2>${esc(empresa)}</h2>
      <div style="font-size:0.85rem;color:var(--muted)">
        Scrum Master: ${sm ? esc(sm.nome) : '<span class="tag-unassigned">não atribuído</span>'} ·
        Owner: ${owner ? esc(owner.nome) : '<span class="tag-unassigned">não atribuído</span>'}
      </div>
    </div>
  </div>
  <div class="teams-grid">
    ${TIMES.map(t => `
      <div class="team-card">
        <img class="team-img" src="${imgs[t] || ""}" alt="${esc(STATE.teamNames[empresa][t])}" />
        <div class="team-body">
          <h3>${esc(STATE.teamNames[empresa][t])}</h3>
          <ul class="role-list">
            ${teamRoster(t).length === 0 ? '<li><span class="tag-unassigned">ninguém atribuído ainda</span></li>' :
      teamRoster(t).sort((a, b) => a.papel === "Product Owner" ? -1 : 1).map(a => `
              <li><span>${esc(a.nome)}</span><span class="role-badge" style="background:${papelBadgeColor(a.papel)}">${a.papel === "Product Owner" ? "PO" : "Dev"}</span></li>
            `).join("")}
          </ul>
        </div>
      </div>`).join("")}
  </div>
</div>`;
}