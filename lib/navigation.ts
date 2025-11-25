import { LayoutDashboard, FileBarChart2, BellRing, Plug, Users2, UserRound, BookOpen, ShoppingCart, TrendingUp, Link2, Send } from 'lucide-react';

export const appNavigation = [
  { name: 'Visão geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Integrações', href: '/integrations', icon: Plug },
  { name: 'Recuperação de Vendas', href: '/recovery', icon: ShoppingCart },
  { name: 'Meta Ads', href: '/meta-ads', icon: TrendingUp },
  { name: 'UTM Tracking', href: '/utm-tracking', icon: Link2 },
  { name: 'Relatórios', href: '/reports', icon: FileBarChart2 },
  { name: 'Notificações', href: '/notifications', icon: BellRing },
  { name: 'Equipe', href: '/team', icon: Users2 },
  { name: 'Perfil', href: '/profile', icon: UserRound },
  { name: 'Como Usar', href: '/help', icon: BookOpen }
];
