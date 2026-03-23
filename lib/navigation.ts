import {
  LayoutDashboard,
  FileBarChart2,
  BellRing,
  Plug,
  Users2,
  UserRound,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Link2,
  Send,
  Bell,
  Palette,
  Webhook,
  Settings
} from 'lucide-react';

export interface NavigationSection {
  section?: string; // Nome da seção (undefined = sem seção)
  items: NavigationItem[];
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  showBadge?: boolean;
  description?: string;
}

export const appNavigationSections: NavigationSection[] = [
  {
    // Dashboard principal (sem label de seção)
    items: [
      {
        name: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview completo do sistema'
      }
    ]
  },
  {
    section: 'Meta Ads',
    items: [
      {
        name: 'Dashboard',
        href: '/ads-dashboard',
        icon: TrendingUp,
        description: 'Métricas e performance de campanhas'
      },
      {
        name: 'Criativos',
        href: '/creatives',
        icon: Palette,
        description: 'Análise de anúncios e fadiga'
      },
      {
        name: 'UTM Builder',
        href: '/utm-tracking',
        icon: Link2,
        description: 'Gerador de links rastreáveis'
      },
      {
        name: 'Conversions API',
        href: '/meta-capi',
        icon: Send,
        description: 'Eventos server-side'
      }
    ]
  },
  {
    section: 'Recuperação',
    items: [
      {
        name: 'Carrinhos Abandonados',
        href: '/recovery',
        icon: ShoppingCart,
        description: 'Sistema de recuperação de vendas'
      },
      {
        name: 'Alertas',
        href: '/alerts',
        icon: Bell,
        showBadge: true,
        description: 'Monitoramento e notificações'
      }
    ]
  },
  {
    section: 'Relatórios',
    items: [
      {
        name: 'Relatórios',
        href: '/reports',
        icon: FileBarChart2,
        description: 'Geração de relatórios em PDF'
      }
    ]
  },
  {
    section: 'Configurações',
    items: [
      {
        name: 'Integrações',
        href: '/integrations',
        icon: Plug,
        description: 'Conectar plataformas'
      },
      {
        name: 'Webhooks',
        href: '/webhooks',
        icon: Webhook,
        description: 'Configurar webhooks'
      },
      {
        name: 'Notificações',
        href: '/notifications',
        icon: BellRing,
        description: 'Central de notificações'
      },
      {
        name: 'Equipe',
        href: '/team',
        icon: Users2,
        description: 'Gerenciar membros e permissões'
      },
      {
        name: 'Perfil',
        href: '/profile',
        icon: UserRound,
        description: 'Editar suas informações'
      },
      {
        name: 'Ajuda',
        href: '/help',
        icon: BookOpen,
        description: 'Como usar o sistema'
      }
    ]
  }
];

// Versão flat para compatibilidade com código existente
export const appNavigation = appNavigationSections.flatMap(section => section.items);
