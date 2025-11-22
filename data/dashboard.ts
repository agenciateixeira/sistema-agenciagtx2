export const modules = [
  {
    id: 'reports',
    title: 'Relatórios Personalizados',
    description:
      'Monte relatórios cruzando métricas por campanha, canal e etapa do funil. Geração instantânea ou agendada.',
    highlights: ['Conversões por campanha', 'Análise de WhatsApp', 'Performance do algoritmo preditivo'],
    status: 'operacional'
  },
  {
    id: 'notifications',
    title: 'Notificações Proativas',
    description:
      'Alertas internos e via e-mail sobre quedas de performance, desconexões e insights preditivos.',
    highlights: ['Queda na conversão', 'Sessões indecisas', 'Integração desconectada'],
    status: 'operacional'
  },
  {
    id: 'academy',
    title: 'Academy GTX',
    description:
      'Tutoriais e onboarding guiado para integrar WhatsApp, UTMs e interpretar os funis.',
    highlights: ['Integração WhatsApp', 'Funil completo', 'Vídeos curtos'],
    status: 'beta'
  },
  {
    id: 'permissions',
    title: 'Equipe & Permissões',
    description:
      'Convide múltiplos usuários, defina papéis e acompanhe logs de atividades.',
    highlights: ['Viewer', 'Editor', 'Admin + auditoria'],
    status: 'operacional'
  },
  {
    id: 'audit',
    title: 'Central de Auditoria',
    description:
      'Registro detalhado de sessões, alertas, webhooks e falhas para suporte e compliance.',
    highlights: ['Eventos de sessão', 'Conversões atribuídas', 'Falhas de API'],
    status: 'operacional'
  },
  {
    id: 'abtest',
    title: 'Teste A/B de Mensagens',
    description:
      'Crie variações para chat preditivo e WhatsApp automático medindo conversão e abandono.',
    highlights: ['Copy A/B', 'Tempo de resposta', 'Efeito no abandono'],
    status: 'em testes'
  },
  {
    id: 'predictive',
    title: 'Performance do Algoritmo Preditivo',
    description:
      'Painel para acompanhar sessões salvas e ajustar intensidade do modelo.',
    highlights: ['Score de abandono', 'Conversões salvas', 'Modo conservador/balanceado/agressivo'],
    status: 'operacional'
  },
  {
    id: 'webhooks',
    title: 'Webhooks Personalizados',
    description:
      'Dispare eventos para CRM, Slack, Notion ou Zapier com filtros e logs.',
    highlights: ['Conversões', 'Alertas', 'Integrações externas'],
    status: 'operacional'
  },
  {
    id: 'chat',
    title: 'Chat Centralizado (Opcional)',
    description:
      'Inbox único do WhatsApp com tags, observações e vínculo automático com conversões.',
    highlights: ['Etiquetas', 'Tempo médio de resposta', 'Conversas que viraram vendas'],
    status: 'roadmap'
  }
];

export const scheduledReports = [
  {
    id: 1,
    name: 'Conversões e CAC - Semanal',
    cadence: 'Semanal',
    channel: 'E-mail + PDF',
    nextRun: '21/11/2025 às 08h'
  },
  {
    id: 2,
    name: 'Monitoramento WhatsApp - Diário',
    cadence: 'Diário',
    channel: 'Dashboard + CSV',
    nextRun: '19/11/2025 às 18h'
  },
  {
    id: 3,
    name: 'Algoritmo Preditivo - Mensal',
    cadence: 'Mensal',
    channel: 'API + XLSX',
    nextRun: '01/12/2025 às 09h'
  }
];

export const notifications = [
  {
    id: 'ntf-1',
    type: 'Queda de conversão',
    severity: 'alta',
    channel: 'In-app + e-mail',
    message: 'Campanha Meta Ads - Conversão caiu 32% nas últimas 12h.',
    time: 'há 12 minutos'
  },
  {
    id: 'ntf-2',
    type: 'Sessões indecisas',
    severity: 'média',
    channel: 'In-app',
    message: 'O algoritmo identificou +54 sessões com risco alto de abandono.',
    time: 'há 1 hora'
  },
  {
    id: 'ntf-3',
    type: 'Integração desconectada',
    severity: 'alta',
    channel: 'E-mail',
    message: 'Webhook do CRM saiu do ar. Último evento recebido há 3h.',
    time: 'há 3 horas'
  }
];

export const tutorials = [
  {
    id: 'tut-1',
    title: 'Integração WhatsApp Business API',
    duration: '06:42',
    status: 'Concluído'
  },
  {
    id: 'tut-2',
    title: 'Configurando UTMs perfeitas',
    duration: '04:15',
    status: 'Pendente'
  },
  {
    id: 'tut-3',
    title: 'Ativando o Algoritmo Preditivo',
    duration: '08:23',
    status: 'Em andamento'
  },
  {
    id: 'tut-4',
    title: 'Entendendo o funil WhatsApp → Site → Conversão',
    duration: '05:51',
    status: 'Pendente'
  }
];

export const onboardingChecklist = [
  { id: 'chk-1', label: 'Conectar WhatsApp Business API', done: true },
  { id: 'chk-2', label: 'Instalar pixel GTX no site', done: true },
  { id: 'chk-3', label: 'Configurar UTMs e campanhas principais', done: false },
  { id: 'chk-4', label: 'Ativar algoritmo preditivo', done: false },
  { id: 'chk-5', label: 'Criar primeiros webhooks', done: false }
];

export const teamMembers = [
  { id: 'usr-1', name: 'Guilherme Teixeira', role: 'Administrador', lastActive: 'há 5 minutos' },
  { id: 'usr-2', name: 'Bruna Marques', role: 'Editora', lastActive: 'há 2 horas' },
  { id: 'usr-3', name: 'Lucas Ferraz', role: 'Somente visualização', lastActive: 'Ontem' }
];

export const auditLog = [
  { id: 'evt-1', event: 'Relatório gerado', detail: 'CAC_Ecommerce_Weekly.pdf enviado para o time comercial.', time: '08:12' },
  { id: 'evt-2', event: 'Webhook entregue', detail: 'Conversão #848 sincronizada com HubSpot.', time: '07:59' },
  { id: 'evt-3', event: 'Integração reconectada', detail: 'WhatsApp Business API online novamente.', time: '07:20' },
  { id: 'evt-4', event: 'Alerta emitido', detail: 'Sessão 9881 marcada como abandono alto.', time: '06:47' }
];

export const abTests = [
  {
    id: 'ab-1',
    name: 'Mensagem WhatsApp - Cart Abandon',
    variantA: { conversion: 38, responseTime: '3m' },
    variantB: { conversion: 46, responseTime: '2m' },
    status: 'Rodando'
  },
  {
    id: 'ab-2',
    name: 'Chat preditivo - saudação',
    variantA: { conversion: 52, responseTime: 'instantâneo' },
    variantB: { conversion: 49, responseTime: 'instantâneo' },
    status: 'Concluído'
  }
];

export const predictivePerformance = {
  sessionsScoreHigh: 312,
  chatInterventions: 102,
  savedConversions: 64,
  intensity: 'Balanceado'
};

export const predictiveTraining = [
  { id: 'ps-1', session: '#8921', label: 'Compraria', impact: '+1,2%' },
  { id: 'ps-2', session: '#8944', label: 'Não compraria', impact: '-0,3%' },
  { id: 'ps-3', session: '#8950', label: 'Compraria', impact: '+0,8%' }
];

export const webhooks = [
  {
    id: 'wh-1',
    name: 'CRM HubSpot',
    event: 'conversion.created',
    events: ['conversion.created', 'session.completed'],
    status: 'Ativo',
    lastDelivery: 'há 2 min'
  },
  {
    id: 'wh-2',
    name: 'Slack #alertas',
    event: 'alert.triggered',
    events: ['alert.triggered', 'performance.drop'],
    status: 'Ativo',
    lastDelivery: 'há 15 min'
  },
  {
    id: 'wh-3',
    name: 'Notion - Diretoria',
    event: 'report.ready',
    events: ['report.ready', 'export.completed'],
    status: 'Pendente',
    lastDelivery: 'há 1 dia'
  }
];

export const chatInbox = [
  {
    id: 'chat-1',
    customer: 'Marina Costa',
    tag: 'Proposta enviada',
    status: 'Aberto',
    lastMessage: 'Cliente pediu revisão de frete',
    conversionLinked: true
  },
  {
    id: 'chat-2',
    customer: 'Otávio Ribeiro',
    tag: 'Follow-up',
    status: 'Em acompanhamento',
    lastMessage: 'Equipe aguardando documentação',
    conversionLinked: false
  },
  {
    id: 'chat-3',
    customer: 'Sneaker Society',
    tag: 'Vip',
    status: 'Resolvido',
    lastMessage: 'Venda confirmada via WhatsApp',
    conversionLinked: true
  }
];

export const currentUserProfile = {
  name: 'Guilherme Teixeira',
  email: 'gui@agenciagtx.com',
  role: 'Administrador',
  phone: '+55 19 99012-2773',
  language: 'Português (Brasil)',
  timezone: 'GMT-3 (Brasília)',
  avatar: '/images/logo.png'
};

export const securityDevices = [
  { id: 1, device: 'Safari • MacBook Pro', location: 'Campinas, Brasil', lastSeen: 'Agora mesmo', status: 'Ativo' },
  { id: 2, device: 'Chrome • Windows', location: 'São Paulo, Brasil', lastSeen: 'Ontem', status: 'Encerrar' }
];
