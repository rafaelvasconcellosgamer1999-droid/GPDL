import { dashboard } from '@/routes'
import type { LucideIcon } from 'lucide-react'
import type { InertiaLinkProps } from '@inertiajs/react';
import {
  Calendar,
  ChartPie,
  FileClock,
  FilePlus,
  FileSearch,
  FileText,
  Home,
  Layers, // <--- Adicionado para o ícone de Lote
  Lock,
  /*Share2,*/
  Shield,
  TriangleAlert,
  Users,
} from 'lucide-react'

export type PermissionKey =
  | 'view_dashboard_page'
  | 'view_process_page'
  | 'create_process'
  | 'edit_process'
  | 'finalize_process'
  | 'view_agenda_page'
  | 'view_reports_page'
  | 'view_admin_page'
  | 'view_squads_page'
  | 'manage_squads_page'
  | 'view_logs_page'
  | 'view_audit_page'
  | 'view_dashboard_menu'
  | 'view_process_menu'
  | 'create_process_menu'
  | 'edit_process_menu'
  | 'view_agenda_menu'
  | 'view_reports_menu'
  | 'view_admin_menu'
  | 'view_squads_menu'
  | 'view_logs_menu'
  | 'view_audit_menu'

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
  href?: InertiaLinkProps['href'];
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
    permission: { key: 'view_dashboard_menu' },
    section: 'main',
  },
  {
    id: 'processos',
    label: 'Processos',
    icon: FileText,
    href: '/processos/ativos',
    match: { segment: 'processos' },
    permission: { key: 'view_process_menu' },
    section: 'main',
    children: [
      // --- SEÇÃO DE CADASTROS ---
      {
        id: 'processos-cadastro',
        label: 'Cadastrar Individual', // Renomeado para ficar claro
        icon: FilePlus,
        href: '/processos/novo',
        match: { segment: 'novo' },
        permission: { key: 'create_process', levels: ['all', 'total', 'sector', 'setor'] },
      },
      {
        id: 'andamentos',
        label: 'Andamentos',
        icon: FileClock,
        href: '/andamentos/cadastro',
        match: { segment: 'andamentos' },
        permission: { key: 'view_process_page' },
      },
      {
        id: 'processos-visualizar',
        label: 'Visualizar',
        icon: FileSearch,
        href: '/processos/visualizar',
        match: { segment: 'visualizar' },
        permission: { key: 'view_process_page' },
      },
      {
        id: 'processos-lote',
        label: 'Cadastrar Lote', // Novo item para importação
        icon: Layers,
        href: '/processos/import',
        match: { segment: 'import' }, // Rota definida no web.php
        permission: { key: 'create_process', levels: ['all', 'total', 'sector', 'setor'] },
      },
      // --- SEÇÃO DE LISTAGEM ---
      {
        id: 'processos-ativos',
        label: 'Ativos',
        icon: FileText,
        href: '/processos/ativos',
        match: { segment: 'ativos' },
      },
      {
        id: 'processos-pendentes',
        label: 'Pendentes',
        icon: TriangleAlert,
        href: '/processos/pendentes',
        match: { segment: 'pendentes' },
      },
      {
        id: 'processos-vencidos',
        label: 'Vencidos',
        icon: TriangleAlert,
        href: '/processos/vencidos',
        match: { segment: 'vencidos' },
      },
      /*{
        id: 'processos-distribuicao',
        label: 'Distribuição',
        icon: Share2,
        href: '/processos/distribuicao',
        match: { segment: 'distribuicao' },
        permission: { key: 'edit_process', levels: ['sector', 'setor', 'all', 'total'] },
      },*/
      {
        id: 'processos-encerrados',
        label: 'Finalizados',
        icon: Lock,
        href: '/processos/encerrados',
        match: { segment: 'encerrados' },
      },
    ],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: Calendar,
    href: '/agenda',
    match: { segment: 'agenda' },
    permission: { key: 'view_agenda_menu' },
    section: 'main',
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: ChartPie,
    href: '/relatorios',
    match: { segment: 'relatorios' },
    permission: { key: 'view_reports_menu' },
    section: 'main',
  },
  {
    id: 'admin',
    label: 'Administração',
    icon: Shield,
    href: '/admin',
    match: { segment: 'admin' },
    permission: { key: 'view_admin_menu' },
    section: 'main',
  },
  {
    id: 'squads',
    label: 'Squads',
    icon: Users,
    href: '/squads',
    match: { segment: 'squads' },
    permission: { key: 'view_squads_menu' },
    section: 'main',
  },
  {
    id: 'logs',
    label: 'Logs do Sistema',
    icon: Shield,
    href: '/logs',
    match: { segment: 'logs' },
    permission: { key: 'view_logs_menu' },
    section: 'monitor',
  },
  {
    id: 'auditoria',
    label: 'Auditoria',
    icon: Shield,
    href: '/auditoria',
    match: { segment: 'auditoria' },
    permission: { key: 'view_audit_menu' },
    section: 'monitor',
  },
]