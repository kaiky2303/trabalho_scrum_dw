export const SPRINTS = [1, 2, 3];
export const TIMES = ["Caça", "Transporte"];
export const BUYERS = ["Governo", "Militar", "Setor Privado"];
export const PAPEIS = [
  "", "Scrum Master", "Product Owner", "Owner/Stakeholder", "Developer",
  "Comprador - Governo", "Comprador - Militar", "Comprador - Setor Privado"
];

export const SEED_NAMES = [
  "ALAN FERREIRA DE OLIVEIRA", "ANDRÉ LUIZ VICENZI RIGO", "ARTHUR HENRIQUE LORENZETT", 
  "BRUNO DE DAVID REIS", "CARLOS EDUARDO ALMEIDA DA CONCEICAO", "CARLOS JHONATAS DE SOUZA AMORIM", 
  "CAUAN BRUNO ALTHAUS RIFFEL", "FILIPE GABRIEL HOLLMANN", "FILIPE JOSÉ DA COSTA NUNES", 
  "GABRIEL CRISTIAN VIVIAN SOMARIVA", "GABRIEL DE CARVALHO BARRETO", "GIOVANI RICARDO POTT", 
  "GUSTAVO SCHWITZKI PERETTI", "ISAEL SOARES DOS SANTOS", "JADSON BUTZK", 
  "JÉSSICA FERNANDA RUBAS", "JOÃO VITOR RAIMUNDI", "KAUAN LUCAS TOLDO", 
  "LEONARDO SCHIMIDT LOPES", "LORENZO PIVA MAY", "MARIA EDUARDA EMELAU JOBIM", 
  "MATTEO DALLA COSTA THOMÉ", "NATAN ELIAS PATZLAFF", "NICOLAS LISBOA FIGUEIREDO MULLER", 
  "NICOLE BONASSI BET", "RAFAEL WILLIAM HAUPT FLORES", "SAMIRA GREGORIO VIEIRA", 
  "VICENTE DAGOSTIN PILONETTO", "VINICIUS TEBALDI BORSATTI", "WILLIAM KUNZLER", "YASMIN MARIA ZERBIELLI"
];

export const TEAM_IMAGES = {
  "Maverick Aviation": { logo: "images/maverick_caca.jpg", Caça: "images/maverick_caca.jpg", Transporte: "images/maverick_cargo.jpg" },
  "SkyForge Ind. Aeronáutica": { logo: "images/skyforge_caca.jpg", Caça: "images/skyforge_caca.jpg", Transporte: "images/skyforge_cargo.jpg" },
};

export const BUYER_IMAGES = {
  "Governo": "images/governo_caca.jpg",
  "Militar": "images/militar.jpg",
  "Setor Privado": "images/empresa_privada.jpg",
};

export const ROLE_COLORS = {
  "Scrum Master": "#455F51", "Product Owner": "#029676", "Owner/Stakeholder": "#0989B1",
  "Developer": "#549E39", "Comprador - Governo": "#E8871E", "Comprador - Militar": "#B33A3A",
  "Comprador - Setor Privado": "#E8871E",
};

export function buildInitialData(empresaA, empresaB) {
  const empresas = [empresaA, empresaB];
  const sm = [], owner = [];
  SPRINTS.forEach(sp => empresas.forEach(emp => {
    sm.push({ sprint: sp, empresa: emp, conduziu: "", removeu: "", ajudou: "", nota: "", obs: "" });
    owner.push({ sprint: sp, empresa: emp, comunicacao: "", negociacao: "", alinhamento: "", notaGeral: "", obs: "" });
  }));

  const po = [], dev = [];
  SPRINTS.forEach(sp => empresas.forEach(emp => TIMES.forEach(t => {
    po.push({ sprint: sp, empresa: emp, time: t, requisitos: "", testes: "", reuniao: "", nota: "", obs: "" });
    dev.push({ sprint: sp, empresa: emp, time: t, qualidade: "", processo: "", colaboracao: "", notaTime: "", destaque: "" });
  })));

  const buyerProf = [];
  SPRINTS.forEach(sp => BUYERS.forEach(b => {
    buyerProf.push({ sprint: sp, comprador: b, checklist: "", decisoes: "", feedback: "", nota: "", obs: "" });
  }));

  const buyerProduct = [];
  SPRINTS.forEach(sp => {
    empresas.forEach(emp => {
      buyerProduct.push({ sprint: sp, comprador: "Governo", empresa: emp, produto: "Caça", pt: "", pv: "", prazo: "", comOwner: "", sinal: "", decisao: "", nota: "" });
      buyerProduct.push({ sprint: sp, comprador: "Governo", empresa: emp, produto: "Transporte", pt: "", pv: "", prazo: "", comOwner: "", sinal: "", decisao: "", nota: "" });
      buyerProduct.push({ sprint: sp, comprador: "Militar", empresa: emp, produto: "Caça", pt: "", pv: "", prazo: "", comOwner: "", sinal: "", decisao: "", nota: "" });
      buyerProduct.push({ sprint: sp, comprador: "Setor Privado", empresa: emp, produto: "Transporte", pt: "", pv: "", prazo: "", comOwner: "", sinal: "", decisao: "", nota: "" });
    });
  });

  const corrupcao = { empresaCorruptora: empresaA, primeiraDescoberta: false, primeiroComprador: "", segundaDescoberta: false, segundoComprador: "" };
  const sabotagem = { empresaSabotador: empresaA, timeSabotador: "Caça", tipoAcao: "atrapalhar", denunciasConsecutivas: 0, descoberto: false, areaSoubeECalou: false };
  const weights = { sm: 1, owner: 1, po: 1, dev: 2, buyer: 2 };
  const teamNames = {
    [empresaA]: { Caça: "Esquadrão Falcon", Transporte: "Falcon Carggo" },
    [empresaB]: { Caça: "SkyForge Combat", Transporte: "SkyForge Transport" },
  };
  const alunos = SEED_NAMES.map((nome, i) => ({ id: i + 1, nome, empresa: "", time: "", papel: "" }));

  return {
    meta: { turma: "", data: "", empresaA, empresaB, fontScale: 16 },
    sm, owner, po, dev, buyerProf, buyerProduct, corrupcao, sabotagem, weights, teamNames, alunos,
  };
}