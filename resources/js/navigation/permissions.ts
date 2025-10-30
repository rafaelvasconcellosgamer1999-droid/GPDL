import type { PermissionKey, PermissionRequirement } from './menu'

export type PermissionValue = string | string[] | boolean | null | undefined

export type PermissionMap = Partial<Record<PermissionKey, PermissionValue>>

const normalizeToken = (input: string): string => {
  const normalized = input
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

  const aliases: Record<string, string> = {
    setor: 'sector',
    setorial: 'sector',
    seccao: 'sector',
    secao: 'sector',
    global: 'all',
    geral: 'all',
    total: 'all',
    todos: 'all',
    completo: 'all',
    completa: 'all',
    inteira: 'all',
  }

  return aliases[normalized] ?? normalized
}

const extractLevels = (value: PermissionValue): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeToken(String(item))).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[|,;\s]+/)
      .map((item) => normalizeToken(item))
      .filter(Boolean)
  }

  return []
}

const resolveTruthy = (value: PermissionValue): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (value === null || value === undefined) {
    return false
  }

  const normalized = normalizeToken(String(value))
  return normalized !== '' && normalized !== '0' && normalized !== 'false' && normalized !== 'nao'
}

export const canAccessPermission = (
  permissions: PermissionMap | undefined,
  requirement?: PermissionRequirement
): boolean => {
  if (!requirement) {
    return true
  }

  if (!permissions) {
    return true
  }

  const rawValue = permissions[requirement.key]

  if (rawValue === null || rawValue === undefined) {
    return false
  }

  if (!requirement.levels?.length) {
    return resolveTruthy(rawValue)
  }

  if (typeof rawValue === 'boolean') {
    return rawValue
  }

  const availableLevels = extractLevels(rawValue)

  if (!availableLevels.length) {
    return false
  }

  const requiredLevels = requirement.levels
    .map((level) => normalizeToken(level))
    .filter(Boolean)

  return requiredLevels.some((required) => availableLevels.includes(required))
}
