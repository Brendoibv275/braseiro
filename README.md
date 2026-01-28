# 🔥 Braseiro - Sistema de Gestão para Hamburgueria

Sistema completo de gestão para hamburguerias, desenvolvido com React, TypeScript e Supabase.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwindcss)

## 📋 Funcionalidades

### 🏠 Dashboard
- Estatísticas em tempo real (vendas do dia, pedidos, ticket médio)
- Gráfico de fluxo de vendas por hora
- Ranking de produtos mais vendidos
- Indicadores de performance

### 🛒 Recepção (PDV)
- Catálogo de produtos por categorias (Hambúrgueres, Batatas, Bebidas)
- Personalização de hambúrgueres com adicionais
- Carrinho de compras intuitivo
- Opção Loja/Delivery para pedidos
- Campo de observações para personalização
- **Mobile**: Carrinho flutuante com popup para melhor UX

### 👨‍🍳 Cozinha (Kanban)
- Quadro Kanban com status: Pendente → Preparando → Pronto → Entregue
- Drag and drop para movimentação de pedidos
- Visualização de observações do cliente
- Timer de tempo de preparo

### 📊 Histórico
- Listagem completa de pedidos finalizados
- Busca por nome, telefone ou pedido
- Ranking de clientes frequentes
- Estatísticas de vendas totais

### 🔐 Autenticação
- Login obrigatório com Supabase Auth
- Sessão persistente
- Logout disponível no header

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS 4
- **Build**: Vite 7
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Ícones**: Lucide React
- **Deploy**: Netlify

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- Conta no [Supabase](https://supabase.com)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/braseiro.git
cd braseiro
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key_do_supabase
```

4. **Execute em desenvolvimento**
```bash
npm run dev
```
Acesse: http://localhost:5173

## 🏗️ Build para Produção

```bash
npm run build
```
Os arquivos serão gerados na pasta `dist/`.

## 🌐 Deploy no Netlify

O projeto está configurado para deploy automático no Netlify:

1. Conecte o repositório GitHub ao Netlify
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push!

## 📁 Estrutura do Projeto

```
braseiro/
├── public/
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── Auth/          # Componentes de autenticação
│   │   ├── Dashboard/     # Componentes do dashboard
│   │   ├── History/       # Componentes do histórico
│   │   ├── Kanban/        # Componentes da cozinha
│   │   ├── Layout/        # Header e Navigation
│   │   └── PDV/           # Componentes do PDV
│   ├── hooks/             # Custom hooks (useAuth, useOrders, etc)
│   ├── lib/               # Cliente Supabase
│   ├── types/             # Tipos TypeScript
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Entry point
├── .env.example           # Template de variáveis
├── netlify.toml           # Configuração Netlify
└── package.json
```

## 🗃️ Banco de Dados (Supabase)

### Tabelas Necessárias

- `produtos` - Catálogo de produtos
- `pedidos` - Pedidos realizados
- Autenticação via Supabase Auth

## 🎨 Design

- **Tema**: Dark mode premium
- **Cores principais**: 
  - Laranja: `#FF4500` (accent)
  - Fundo: `#0a0a0a`
  - Cards: `#141414`
- **Responsivo**: Mobile-first design

## 📱 Mobile First

O sistema foi desenvolvido com foco em dispositivos móveis:
- Navegação inferior fixa
- Cards compactos
- Carrinho flutuante
- Touch-friendly

## 📄 Licença

Este projeto é privado e de uso exclusivo.

---

Desenvolvido com 🔥 para **Braseiro Nordestino**
