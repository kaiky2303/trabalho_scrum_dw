export default function Topbar() {
  return (
    <div className="topbar">
      <div>
        <h1>Painel de Avaliação — Simulação Scrum Competitiva</h1>
        <div className="sub" id="fileNameLbl">(nenhum arquivo carregado)</div>
      </div>
      <div className="topbar-actions">
        <div className="fontctrl">
          <span className="lbl">Fonte</span>
          <button id="fontMinus" title="Diminuir fonte">A−</button>
          <button id="fontReset" title="Restaurar fonte padrão">A</button>
          <button id="fontPlus" title="Aumentar fonte">A+</button>
          <span className="lbl" id="fontLbl">16px</span>
        </div>
        <input type="file" id="fileInput" accept="application/json,.json" style={{ display: 'none' }} />
        <button className="btn btn-load" id="btnLoad">📂 Carregar dados (.json)</button>
        <button className="btn btn-save" id="btnSave">💾 Salvar dados (.json)</button>
        <button className="btn btn-reset" id="btnReset">Limpar tudo</button>
      </div>
    </div>
  );
}