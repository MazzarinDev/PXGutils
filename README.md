# 🎮 PXGManager - PokeXgames Guild & Task Manager

Um utilitário moderno e elegante para gerenciar atividades de guilda no MMORPG **PokeXgames (PXG)**. Organize Quests, Catch, Profissões e Tasks Diárias com um painel Kanban interativo, sistema de alarmes e dashboard de progresso.

![PXGManager](https://img.shields.io/badge/version-1.0.0-blue) ![Status](https://img.shields.io/badge/status-production--ready-green) ![License](https://img.shields.io/badge/license-MIT-purple)

---

## ✨ Características Principais

### 📋 Painel Kanban Interativo
- **Drag-and-drop** entre colunas personalizáveis
- 4 colunas padrão: Quests, Catch, Profissões, Tasks Diárias
- Cartões informativos com prioridade, datas e tags
- Indicadores visuais para tarefas atrasadas

### 🎯 Sistema de Tarefas Avançado
- 5 tipos de tarefas: Quest, Catch, Profession, Daily, Custom
- 4 níveis de prioridade: Baixa, Média, Alta, Crítica
- 4 status: A Fazer, Em Progresso, Concluído, Arquivado
- Data e hora de vencimento com notificações
- Atribuição a membros da guilda
- Tags personalizáveis para organização

### 🔔 Sistema de Alarmes
- Tipos: Boss Respawn, Invasion, Cooldown, Event, Custom
- Notificações prévias configuráveis
- Alarmes recorrentes
- Notificação automática de membros

### 📊 Dashboard de Progresso
- Métricas em tempo real
- Gráficos interativos (Pie, Bar, Line)
- Distribuição de status, prioridade e tipos
- Tarefas em progresso e atividade recente
- Filtros por período (Semana, Mês, Tudo)

### 👥 Gestão Colaborativa de Guildas
- Criação de guildas com descrição
- Adição de membros com código de convite
- Sistema de permissões (Leader, Officer, Member)
- Visualização compartilhada de progresso
- Estatísticas agregadas de guilda

### 🎨 Interface Moderna
- Tema escuro elegante com paleta MMORPG
- Responsivo para mobile, tablet e desktop
- Animações suaves e transições
- Ícones temáticos
- Acessibilidade garantida

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/pxg-manager.git
cd pxg-manager

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Execute migrações do banco de dados
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse `http://localhost:3000` no seu navegador.

---

## 📖 Guia de Uso

### Criando uma Guilda

1. Clique em **"Nova Guilda"** na barra lateral
2. Preencha o nome e descrição
3. Clique em **"Criar Guilda"**
4. Você será automaticamente adicionado como **Leader**

### Adicionando Membros

1. Acesse a guilda
2. Vá para **"Guildas"** no menu
3. Clique em **"Gerenciar Membros"**
4. Compartilhe o código de convite com seus amigos

### Criando Tarefas

1. No painel **Kanban**, clique em **"Adicionar"** em qualquer coluna
2. Preencha os detalhes:
   - **Título:** Nome da tarefa
   - **Descrição:** Detalhes adicionais
   - **Tipo:** Quest, Catch, Profession, Daily ou Custom
   - **Prioridade:** Baixa, Média, Alta ou Crítica
   - **Data/Hora:** Data e hora de vencimento
   - **Atribuir a:** Membro da guilda
   - **Tags:** Categorias personalizadas

3. Clique em **"Criar Tarefa"**

### Movendo Tarefas

1. Arraste um cartão de tarefa
2. Solte em outra coluna
3. O status será atualizado automaticamente

### Criando Alarmes

1. Acesse a guilda
2. Clique em **"Alarmes"** no menu
3. Clique em **"Novo Alarme"**
4. Configure:
   - **Título:** Nome do alarme
   - **Tipo:** Boss Respawn, Invasion, Cooldown, Event ou Custom
   - **Data/Hora:** Quando o evento ocorrerá
   - **Notificar antes:** Minutos antes do evento
   - **Recorrente:** Se é um evento que se repete

5. Clique em **"Criar Alarme"**

### Visualizando Progresso

1. Clique em **"Dashboard"** no menu
2. Veja as métricas:
   - Total de tarefas
   - Tarefas concluídas
   - Taxa de conclusão
   - Membros ativos
3. Use os filtros de período (Semana, Mês, Tudo)

---

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL/TiDB + Drizzle ORM
- **Auth:** Manus OAuth
- **Build:** Vite 7
- **Testing:** Vitest 2

### Estrutura de Banco de Dados

```
users (autenticação)
├── guilds (organizações)
│   ├── guildMembers (membros)
│   ├── taskCategories (colunas)
│   ├── tasks (tarefas)
│   │   └── taskHistory (auditoria)
│   ├── alarms (eventos)
│   ├── tags (categorias)
│   ├── notifications (alertas)
│   └── guildStats (métricas)
```

---

## 🔒 Segurança

- **Autenticação:** OAuth via Manus (sem armazenamento de senhas)
- **Autorização:** RBAC (Role-Based Access Control)
- **Validação:** Zod em todas as procedures tRPC
- **SQL Injection:** Prevenção via ORM
- **CSRF:** Proteção via SameSite cookies

---

## 📊 Permissões de Guilda

| Ação | Leader | Officer | Member |
|------|--------|---------|--------|
| Editar Tarefas | ✅ | ✅ | ❌ |
| Deletar Tarefas | ✅ | ✅ | ❌ |
| Gerenciar Membros | ✅ | ❌ | ❌ |
| Criar Alarmes | ✅ | ✅ | ❌ |
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Kanban | ✅ | ✅ | ✅ |

---

## 📦 Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Iniciar servidor de desenvolvimento
pnpm build                  # Build para produção
pnpm start                  # Iniciar servidor em produção

# Banco de Dados
pnpm drizzle-kit generate   # Gerar migrações
pnpm drizzle-kit migrate    # Aplicar migrações

# Testes
pnpm test                   # Executar testes
pnpm test:watch            # Testes em modo watch

# Qualidade de Código
pnpm check                  # TypeScript check
pnpm format                 # Formatar código
```

---

## 🌍 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/pxg_manager

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu-website-id
```

---

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)

---

## 🎨 Tema e Customização

### Cores Principais

- **Fundo:** Slate 900 (#0f172a)
- **Superfície:** Slate 800 (#1e293b)
- **Primária:** Indigo 600 (#4f46e5)
- **Sucesso:** Green 400 (#4ade80)
- **Aviso:** Yellow 400 (#facc15)
- **Erro:** Red 400 (#f87171)

### Customizar Cores

Edite `client/src/index.css` e modifique as variáveis CSS:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    /* ... outras cores ... */
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    /* ... outras cores ... */
  }
}
```

---

## 🚀 Deploy

### Manus Hosting (Recomendado)

O PXGManager está pronto para deploy no **Manus Hosting**:

1. Clique em **"Publish"** no painel de controle
2. Configure seu domínio customizado (opcional)
3. Clique em **"Deploy"**

### Outros Hosts

O projeto pode ser deployado em qualquer host que suporte Node.js:

```bash
# Build
pnpm build

# Deploy
# Copie a pasta `dist` para seu servidor
# Configure as variáveis de ambiente
# Inicie com: node dist/index.js
```

---

## 📚 Documentação Adicional

- [Relatório Técnico](./TECHNICAL_REPORT.md) - Detalhes de arquitetura e implementação
- [API Documentation](./docs/API.md) - Referência completa de endpoints
- [Contributing Guide](./CONTRIBUTING.md) - Como contribuir

---

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma issue no GitHub:

1. Vá para [Issues](https://github.com/seu-usuario/pxg-manager/issues)
2. Clique em **"New Issue"**
3. Descreva o problema com detalhes
4. Anexe screenshots se possível

---

## 💡 Sugestões de Melhorias

Tem uma ideia? Compartilhe conosco:

1. Abra uma issue com o label `enhancement`
2. Descreva sua sugestão
3. Explique por que seria útil

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

---

## 👨‍💻 Desenvolvedor

**MazzarinDev**

- GitHub: [@MazzarinDev](https://github.com/MazzarinDev)
- Email: dev@mazzarin.com

---

## 🙏 Agradecimentos

- Comunidade PokeXgames
- Equipe Manus
- Contribuidores e testadores

---

## 📞 Suporte

Precisa de ajuda?

- 📖 Leia a [documentação](./docs)
- 💬 Abra uma issue no GitHub
- 📧 Entre em contato com o desenvolvedor

---

**PXGManager v1.0.0** - Desenvolvido com ❤️ para a comunidade PokeXgames

Última atualização: 30 de Março de 2026
