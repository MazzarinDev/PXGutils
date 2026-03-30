# PXGManager - Project TODO

## Core Features

### Phase 1: Database & Schema
- [x] Criar schema de usuários com perfil de guilda
- [x] Criar schema de guildas com membros e permissões
- [x] Criar schema de tarefas (Quests, Catch, Profissões, Tasks Diárias)
- [x] Criar schema de alarmes e notificações
- [x] Criar schema de tags e categorias personalizáveis
- [x] Criar schema de histórico de tarefas completadas
- [x] Executar migrações SQL no banco de dados

### Phase 2: Backend Development
- [x] Implementar procedures tRPC para autenticação (login, logout, perfil)
- [x] Implementar procedures tRPC para gerenciamento de guildas (criar, listar, adicionar membros)
- [x] Implementar procedures tRPC para CRUD de tarefas (criar, atualizar, deletar, listar)
- [x] Implementar procedures tRPC para sistema de alarmes (criar, listar, disparar notificações)
- [x] Implementar procedures tRPC para permissões (verificar acesso, editar compartilhado)
- [x] Implementar procedures tRPC para histórico e estatísticas
- [x] Implementar procedures tRPC para filtros e busca avançada
- [x] Escrever testes vitest para procedures críticas

### Phase 3: Frontend - Kanban & Tarefas
- [x] Criar componente Kanban com colunas personalizáveis
- [x] Implementar drag-and-drop de cartões entre colunas
- [x] Criar componente de cartão de tarefa com informações básicas
- [x] Implementar editor de tarefas (modal/drawer com formulário)
- [x] Adicionar suporte a datas e horários fixos de entrega
- [x] Implementar sistema de prioridades visuais nos cartões
- [x] Criar componente de seletor de data/hora com calendário

### Phase 4: Frontend - Dashboard & Progresso
- [x] Criar dashboard com métricas de conclusão de tarefas
- [x] Implementar gráficos de progresso individual e de guilda
- [x] Criar widget de estatísticas de tarefas completadas
- [x] Implementar visualização de histórico de tarefas
- [x] Adicionar filtros por tipo, prioridade e status
- [x] Implementar busca por nome de tarefa

### Phase 5: Frontend - Colaboração & Notificações
- [x] Criar painel de gerenciamento de guildas
- [x] Implementar sistema de permissões (visualizar, editar, deletar)
- [x] Criar sistema de notificações em tempo real
- [x] Implementar alarmes visuais e sonoros para eventos
- [x] Adicionar compartilhamento de tarefas entre membros da guilda
- [x] Criar lista de membros da guilda com status online

### Phase 6: UI/UX & Tema MMORPG
- [x] Definir paleta de cores elegante com tema MMORPG
- [x] Implementar tema escuro como padrão
- [x] Adicionar fontes e efeitos visuais temáticos
- [x] Implementar responsividade para mobile/tablet
- [x] Adicionar animações e transições suaves
- [x] Criar layout responsivo do Kanban
- [x] Implementar menu de navegação principal
- [x] Polir componentes com ícones temáticos

### Phase 7: Advanced Features
- [x] Implementar sistema de tags personalizáveis
- [x] Criar sistema de categorias customizáveis
- [x] Adicionar suporte a múltiplas guildas por usuário
- [ ] Implementar sincronização em tempo real (WebSocket)
- [ ] Adicionar exportação de relatórios (CSV/PDF)
- [ ] Implementar dark mode toggle

### Phase 8: Testing & Documentation
- [x] Escrever testes vitest para componentes críticos
- [x] Testar fluxos de autenticação e permissões
- [x] Testar drag-and-drop do Kanban
- [x] Testar sistema de alarmes e notificações
- [x] Criar documentação de uso para jogadores
- [x] Criar documentação técnica para desenvolvedores

### Phase 9: Deployment & Finalization
- [x] Criar checkpoint final do projeto
- [x] Redigir relatório técnico de 70h (outubro 2025, MazzarinDev)
- [x] Preparar repositório GitHub com README e documentação
- [x] Solicitar token GitHub para publicação

## Bugs & Fixes
(Nenhum registrado ainda)

## Notes
- Direção visual: Elegant and perfect style com temática MMORPG
- Stack: React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL
- Autenticação: Manus OAuth
- Foco em experiência do usuário e coordenação em tempo real
