# ✈️ Painel de Avaliação — Simulação Scrum Competitiva

Sistema Web interativo desenvolvido em **React** e **Vite** para a gestão, acompanhamento e avaliação da simulação competitiva de projetos aeronáuticos utilizando a metodologia **Scrum**.

---

## 📋 Sumário
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Passo a Passo](#-instalação-passo-a-passo)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Funcionalidades da Aplicação](#-funcionalidades-da-aplicação)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)

---

## 🛑 Pré-requisitos

Antes de iniciar a instalação e execução do projeto, certifique-se de ter os seguintes softwares instalados em seu computador:

1. **Node.js** (Versão 18.0.0 ou superior recomendada)
   - Baixar e instalar: [https://nodejs.org/](https://nodejs.org/)
2. **npm** (Gerenciador de pacotes, instalado automaticamente junto com o Node.js)
3. **Git** (Para clonagem do repositório)

Para verificar se você já possui o Node.js e o npm instalados, abra seu terminal (PowerShell, Command Prompt ou Terminal do VS Code) e execute:

```bash
node -v
npm -v
```

---

## 📥 Instalação Passo a Passo

### 1. Clonar ou Baixar o Repositório
Abra o terminal no diretório de sua preferência e execute:

```bash
git clone <URL_DO_REPOSITORIO>
cd trabaio_dw
```
*(Caso tenha recebido o projeto compactado em formato `.zip`, basta extraí-lo e abrir o terminal dentro da pasta raiz do projeto).*

### 2. Instalar as Dependências do Projeto
No diretório raiz do projeto, execute o comando abaixo para instalar todas as bibliotecas necessárias (React, Vite, Lucide React, etc.):

```bash
npm install
```

---

## 📁 Estrutura de Arquivos

Para garantir que os recursos visuais (imagens dos times e compradores) sejam carregados corretamente, certifique-se de que a estrutura esteja configurada da seguinte forma:

```text
trabaio_dw/
├── public/
│   └── images/
│       ├── teams/
│       │   ├── maverick_caca.jpg
│       │   ├── maverick_cargo.jpg
│       │   ├── skyforge_caca.jpg
│       │   └── skyforge_cargo.jpg
│       └── buyers/
│           ├── comprador_caca.jpg
│           └── comprador_transporte.jpg
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── constants.js
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

---

## 🚀 Como Executar o Projeto

Com as dependências instaladas, execute o servidor de desenvolvimento local:

```bash
npm run dev
```

Após o comando, o Vite iniciará o servidor e exibirá um endereço local no terminal. Abra o navegador e acesse:

👉 **`http://localhost:5173`** (ou o endereço indicado no terminal).
