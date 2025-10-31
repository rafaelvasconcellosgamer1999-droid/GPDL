import { dashboard } from '@/routes'
import type { LucideIcon } from 'lucide-react'
import type { InertiaLinkProps } from '@inertiajs/react';
import {
  Calendar,
  ChartPie,
  FileText,
  Home,
  Lock,
  Plus,
  Share2,
  Shield,
  TriangleAlert,
  Users,
} from 'lucide-react'

export type PermissionKey =
  | 'view_dashboard'
  | 'view_process'
  | 'create_process'
  | 'edit_process'
  | 'finalize_process'
  | 'view_agenda'
  | 'view_reports'
  | 'view_admin'
  | 'view_squads'
  | 'manage_squads'
  | 'view_logs'
  | 'view_audit'

export type PermissionRequirement = {
  key: PermissionKey
  levels?: string[]
}

export type { PermissionMap, PermissionValue } from './permissions'

export type NavigationMatch = {
  segment?: string
  query?: { key: string; value: string }
}

export type NavigationItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  section?: 'main' | 'monitor';
  href?: InertiaLinkProps['href']; // aceita string ou RouteDefinition
  match?: NavigationMatch;
  permission?: PermissionRequirement;
  children?: NavigationItem[];
};

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Início',
    icon: Home,
    href: dashboard(),
    match: { segment: 'dashboard' },
    permission: { key: 'view_dashboard' },
    section: 'main',
  },
  {
    id: 'processos',
    label: 'Processos',
    icon: FileText,
    href: '/processos?view=ativos',
    match: { segment: 'processos' },
    permission: { key: 'view_process' },
    section: 'main',
    children: [
      {
        id: 'processos-cadastro',
        label: 'Cadastro',
        icon: Plus,
        href: '/processos?view=cadastro',
        match: { segment: 'processos', query: { key: 'view', value: 'cadastro' } },
        permission: { key: 'create_process', levels: ['all', 'total', 'sector', 'setor'] },
      },
      {
        id: 'processos-ativos',
        label: 'Ativos',
        icon: FileText,
        href: '/processos?view=ativos',
        match: { segment: 'processos', query: { key: 'view', value: 'ativos' } },
      },
      {
        id: 'processos-pendentes',
        label: 'Pendentes',
        icon: TriangleAlert,
        href: '/processos?view=pendentes',
        match: { segment: 'processos', query: { key: 'view', value: 'pendentes' } },
      },
      {
        id: 'processos-vencidos',
        label: 'Vencidos',
        icon: TriangleAlert,
        href: '/processos?view=vencidos',
        match: { segment: 'processos', query: { key: 'view', value: 'vencidos' } },
      },
      {
        id: 'processos-encerrados',
        label: 'Finalizados',
        icon: Lock,
        href: '/processos?view=encerrados',
        match: { segment: 'processos', query: { key: 'view', value: 'encerrados' } },
      },
      {
        id: 'processos-distribuicao',
        label: 'Distribuição',
        icon: Share2,
        href: '/processos?view=distribuicao',
        match: { segment: 'processos', query: { key: 'view', value: 'distribuicao' } },
        permission: { key: 'edit_process', levels: ['sector', 'setor', 'all', 'total'] },
      },
    ],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: Calendar,
    href: '/agenda',
    match: { segment: 'agenda' },
    permission: { key: 'view_agenda' },
    section: 'main',
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: ChartPie,
    href: '/relatorios',
    match: { segment: 'relatorios' },
    permission: { key: 'view_reports' },
    section: 'main',
  },
  {
    id: 'admin',
    label: 'Administração',
    icon: Shield,
    href: '/admin',
    match: { segment: 'admin' },
    permission: { key: 'view_admin' },
    section: 'main',
  },
  {
    id: 'squads',
    label: 'Squads',
    icon: Users,
    href: '/squads',
    match: { segment: 'squads' },
    permission: { key: 'view_squads' },
    section: 'main',
  },
  {
    id: 'logs',
    label: 'Logs do Sistema',
    icon: Shield,
    href: '/logs',
    match: { segment: 'logs' },
    permission: { key: 'view_logs' },
    section: 'monitor',
  },
  {
    id: 'auditoria',
    label: 'Auditoria',
    icon: Shield,
    href: '/auditoria',
    match: { segment: 'auditoria' },
    permission: { key: 'view_audit' },
    section: 'monitor',
  },
]
