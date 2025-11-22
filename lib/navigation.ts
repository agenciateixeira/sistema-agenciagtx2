import { LayoutDashboard, FileBarChart2, BellRing, Share2, Users2, UserRound } from 'lucide-react';

export const appNavigation = [
  { name: 'Visão geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Relatórios', href: '/reports', icon: FileBarChart2 },
  { name: 'Notificações', href: '/notifications', icon: BellRing },
  { name: 'Webhooks', href: '/webhooks', icon: Share2 },
  { name: 'Equipe', href: '/team', icon: Users2 },
  { name: 'Perfil', href: '/profile', icon: UserRound }
];
