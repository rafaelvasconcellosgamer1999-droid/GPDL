# 🎨 Guia de Migração de Estilização - GPDL

## ✅ O que foi feito

Migrei todo o sistema de cores e design do projeto antigo para o novo, mantendo **100% da identidade visual**.

### 📁 Arquivos criados:
- `resources/css/gpdl-theme.css` - Todas as variáveis CSS e componentes customizados

### 🔧 Arquivos modificados:
- `resources/css/app.css` - Importa o tema GPDL

---

## 🎯 Como usar as cores do GPDL no Tailwind

### **Método 1: Classes Tailwind com variáveis CSS**

```tsx
// Backgrounds
<div className="bg-[var(--surface-card)]">
<div className="bg-[var(--surface-main)]">
<div className="bg-[var(--surface-muted)]">

// Texto
<p className="text-[var(--text-strong)]">
<p className="text-[var(--text-muted)]">

// Brand colors
<button className="bg-[var(--brand-700)] text-white">
<div className="text-[var(--brand-600)]">

// Status colors
<span className="text-[var(--success-500)]">✓</span>
<span className="text-[var(--warning-500)]">⚠</span>
<span className="text-[var(--danger-500)]">✗</span>
```

### **Método 2: Classes CSS prontas**

```tsx
// Components prontos
<span className="gpdl-badge">Badge estilizado</span>
<a className="gpdl-link">Link com animação</a>
<div className="gpdl-background">Fundo com gradientes</div>

// Ícones
<div className="shortcut-icon is-blue">
  <i className="fas fa-file"></i>
</div>

<div className="stat-icon is-green">
  <i className="fas fa-check"></i>
</div>

// Timeline
<ul className="gpdl-timeline">
  <li>Evento 1</li>
  <li>Evento 2</li>
</ul>

// Métricas
<div>
  <p className="metric-label">Total</p>
  <p className="metric-value success">1.234</p>
  <p className="metric-trend">↑ 12%</p>
</div>
```

---

## 🎨 Cores disponíveis

### **Superfícies**
- `--surface-main` - Fundo principal
- `--surface-muted` - Fundo menos destacado
- `--surface-card` - Cards e painéis
- `--surface-task` - Background de tarefas

### **Brand Colors**
- `--brand-950` até `--brand-500` - Escala de azul
- `--gpdl-sidebar` - Cor da sidebar (#1345b1)

### **Status**
- `--success-500` - Verde de sucesso
- `--warning-500` - Amarelo de aviso
- `--danger-500` - Vermelho de erro

### **Accent Colors**
- `--accent-info`, `--accent-info-soft`, `--accent-info-border`
- `--accent-success`, `--accent-success-soft`, `--accent-success-border`
- `--accent-warning`, `--accent-warning-soft`, `--accent-warning-border`
- `--accent-danger`, `--accent-danger-soft`, `--accent-danger-border`

### **Utilitários**
- `--text-strong` - Texto forte
- `--text-muted` - Texto esmaecido
- `--gpdl-border` - Bordas
- `--shadow-card` - Sombra de cards

---

## 🌓 Dark Mode

O tema **automaticamente adapta** todas as cores ao dark mode quando a classe `.dark` está no HTML:

```tsx
// No layout
<html className={isDark ? 'dark' : ''}>
```

Todas as variáveis CSS ajustam automaticamente. Não precisa fazer nada extra!

---

## 💡 Exemplos práticos

### **Card do projeto antigo:**
```html
<!-- ANTES (projeto antigo) -->
<div class="card">
  <h3>Título</h3>
  <p>Conteúdo</p>
</div>
```

```tsx
// AGORA (projeto novo)
<div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-[var(--shadow-card)]">
  <h3 className="text-[var(--text-strong)] font-semibold">Título</h3>
  <p className="text-[var(--text-muted)]">Conteúdo</p>
</div>

// OU usando componente shadcn/ui
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo</p>
  </CardContent>
</Card>
```

### **Botão primário:**
```tsx
// Com as cores GPDL
<button className="
  bg-[var(--brand-700)] 
  hover:bg-[var(--brand-600)] 
  text-white 
  px-4 py-2 rounded-lg 
  transition-colors
">
  Salvar
</button>

// OU usando componente Button do shadcn
<Button>Salvar</Button>
```

### **Badge de status:**
```tsx
// Sucesso
<span className="gpdl-badge bg-[var(--accent-success-soft)] border-[var(--accent-success-border)] text-[var(--accent-success)]">
  Aprovado
</span>

// Aviso
<span className="gpdl-badge bg-[var(--accent-warning-soft)] border-[var(--accent-warning-border)] text-[var(--accent-warning)]">
  Pendente
</span>
```

### **Ícone de atalho:**
```tsx
<div className="flex items-center gap-3">
  <div className="shortcut-icon is-blue">
    <i className="fas fa-folder"></i>
  </div>
  <div>
    <strong className="text-[var(--text-strong)]">Processos</strong>
    <span className="text-[var(--text-muted)] text-sm">Ver todos</span>
  </div>
</div>
```

---

## 🚀 Próximos passos

### 1. **Componentes específicos**
Se você tem componentes muito específicos do projeto antigo (como tabelas customizadas, painéis especiais), podemos migrá-los também.

### 2. **Ícones**
O projeto antigo usa Font Awesome. Você pode:
- Continuar usando Font Awesome
- Migrar para Lucide React (já instalado): `import { FileText } from 'lucide-react'`

### 3. **Componentes reutilizáveis**
Crie componentes React para padrões que você usa muito:

```tsx
// components/gpdl/StatusBadge.tsx
export function StatusBadge({ status, children }) {
  const colors = {
    success: 'accent-success',
    warning: 'accent-warning',
    danger: 'accent-danger',
  }
  
  return (
    <span className={`gpdl-badge bg-[var(--${colors[status]}-soft)] ...`}>
      {children}
    </span>
  )
}

// Uso
<StatusBadge status="success">Aprovado</StatusBadge>
```

---

## 📚 Recursos

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev

--