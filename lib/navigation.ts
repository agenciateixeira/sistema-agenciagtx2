import { LayoutDashboard, FileBarChart2, BellRing, Plug, Users2, UserRound, BookOpen, ShoppingCart } from 'lucide-react';

export const appNavigation = [
  { name: 'Visão geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Integrações', href: '/integrations', icon: Plug },
  { name: 'Recuperação de Vendas', href: '/recovery', icon: ShoppingCart },
  { name: 'Relatórios', href: '/reports', icon: FileBarChart2 },
  { name: 'Notificações', href: '/notifications', icon: BellRing },
  { name: 'Equipe', href: '/team', icon: Users2 },
  { name: 'Perfil', href: '/profile', icon: UserRound },
  { name: 'Como Usar', href: '/help', icon: BookOpen }
];
