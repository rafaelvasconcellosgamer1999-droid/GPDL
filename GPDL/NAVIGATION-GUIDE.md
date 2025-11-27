# 🗺️ Guia de Navegação e Layout - GPDL

## ✅ O que foi migrado

Migrei completamente a estrutura de navegação do projeto antigo para o novo:

### 📦 Arquivos criados:

1. **`resources/js/components/gpdl-sidebar.tsx`**
   - Sidebar completa do GPDL
   - Navegação principal e secundária
   - Submenus expansíveis (ex: Processos)
   - Card promocional
   - Sistema de permissões preparado

2. **`resources/js/layouts/gpdl-layout.tsx`**
   - Layout padrão do sistema
   - Integra sidebar + header + conteúdo
   - Background com cores do tema

3. **`resources/js/pages/dashboard.tsx`** (atualizado)
   - Exemplo de como usar o layout

---

## 🎯 Como funciona o sistema de navegação

### **Estrutura do projeto antigo (PHP):**
```
layout.php
├── sidebar.php (navegação)
├── topbar.php (header)
└── $content (conteúdo da página)
```

### **Estrutura do projeto novo (React + Inertia):**
```
GPDLLayout
├── GPDLSidebar (navegação)
├── AppSidebarHeader (breadcrumbs + user menu)
└── children (conteúdo da página)
```

---

## 📄 Como criar uma nova página

### **1. Criar o arquivo da página**

```tsx
// resources/js/pages/processos/Ativos.tsx
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs = [
    { title: 'Processos', href: '/processos' },
    { title: 'Ativos', href: '/processos?view=ativos' },
];

export default function ProcessosAtivos() {
    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <Head title="Processos Ativos - GPDL" />
            
            <Card>
                <CardHeader>
                    <CardTitle>Processos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Conteúdo da página aqui</p>
                </CardContent>
            </Card>
        </GPDLLayout>
    );
}
```

### **2. Criar a rota no Laravel**

```php
// routes/web.php
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('/processos', function () {
        $view = request('view', 'ativos');
        
        return match($view) {
            'cadastro' => Inertia::render('processos/Cadastro'),
            'ativos' => Inertia::render('processos/Ativos'),
            'pendentes' => Inertia::render('processos/Pendentes'),
            'distribuicao' => Inertia::render('processos/Distribuicao'),
            'encerrados' => Inertia::render('processos/Encerrados'),
            default => Inertia::render('processos/Ativos'),
        };
    });
});
```

### **3. A navegação já funciona automaticamente!**

Quando o usuário clicar em "Processos > Ativos" na sidebar, o Inertia vai:
- Fazer uma requisição para `/processos?view=ativos`
- Renderizar o componente `processos/Ativos.tsx`
- Manter o layout (sidebar + header)
- Atualizar apenas o conteúdo

**SEM reload da página! 🚀**

---

## 🔄 Comparação: Projeto Antigo vs Novo

### **Projeto Antigo (PHP tradicional):**
```php
// Cada clique recarrega a página inteira
<a href="<?= BASE_URL ?>processos?view=ativos">Ativos</a>
// ↓ Reload completo ↓
// HTML inteiro é renderizado novamente
```

### **Projeto Novo (Inertia.js):**
```tsx
// Navegação instantânea, sem reload
<Link href="/processos?view=ativos">Ativos</Link>
// ↓ Apenas troca o JSON ↓
// Só o conteúdo muda, layout permanece
```

---

## 🎨 Estrutura da Sidebar

A sidebar está organizada em **seções**:

```tsx
// Em gpdl-sidebar.tsx
const navigationSections = [
    {
        title: 'Principal',  // Seção
        items: [
            {
                title: 'Início',
                icon: LayoutDashboard,
                href: '/dashboard',
            },
            {
                title: 'Processos',  // Item com submenu
                icon: FolderKanban,
                items: [
                    { title: 'Cadastrar', href: '/processos?view=cadastro' },
                    { title: 'Ativos', href: '/processos?view=ativos' },
                    // ...
                ],
            },
            // ...
        ],
    },
    {
        title: 'Monitoramento',  // Outra seção
        items: [
            { title: 'Logs', href: '#' },
            // ...
        ],
    },
];
```

### **Para adicionar um novo item:**

1. Edite `resources/js/components/gpdl-sidebar.tsx`
2. Adicione o item no array `navigationSections`
3. Pronto! Aparecerá automaticamente na sidebar

**Exemplo:**
```tsx
{
    title: 'Relatórios',
    icon: PieChart,
    href: '/relatorios',
    permission: 'view_reports',
}
```

---

## 🔐 Sistema de Permissões

O código já está preparado para permissões:

```tsx
// Cada item pode ter uma permissão
{
    title: 'Administração',
    icon: ShieldCheck,
    href: '/admin',
    permission: 'view_admin',  // ← só aparece se tiver permissão
}
```

**Para ativar as permissões reais:**

1. Configure o backend para enviar as permissões do usuário
2. Edite a função `hasPermission()` em `gpdl-sidebar.tsx`:

```tsx
// Substitua isso:
const hasPermission = (permission?: string) => {
    return true; // Temporário
};

// Por isso:
const hasPermission = (permission?: string) => {
    if (!permission) return true;
    const { auth } = usePage().props;
    return auth.user.permissions.includes(permission);
};
```

---

## 📱 Responsividade

A sidebar é **automaticamente responsiva**:

- **Desktop**: Sidebar fixa na lateral
- **Mobile**: Sidebar escondida, abre com botão hamburguer
- **Colapsável**: Pode minimizar a sidebar (ícone)

---

## 🎭 Dark Mode

O dark mode **já está integrado**:

```tsx
// O tema ajusta automaticamente todas as cores
<div className="bg-[var(--surface-card)] text-[var(--text-strong)]">
```

Para trocar o tema, use o botão no header (já existe no `AppSidebarHeader`).

---

## 🧩 Componentes disponíveis

Você tem acesso a todos os componentes shadcn/ui:

```tsx
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    Button,
    Input,
    Select,
    Table,
    Dialog,
    // ... e muitos mais
} from '@/components/ui/...';
```

**Documentação:** https://ui.shadcn.com

---

## 📊 Exemplo: Página de Tabela

```tsx
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProcessosAtivos({ processos }) {
    return (
        <GPDLLayout breadcrumbs={[
            { title: 'Processos', href: '/processos' },
            { title: 'Ativos', href: '/processos?view=ativos' },
        ]}>
            <Head title="Processos Ativos" />
            
            <Card className="bg-[var(--surface-card)]">
                <CardHeader>
                    <CardTitle>Processos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Assunto</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processos.map((processo) => (
                                <TableRow key={processo.id}>
                                    <TableCell>{processo.numero}</TableCell>
                                    <TableCell>{processo.assunto}</TableCell>
                                    <TableCell>
                                        <span className="gpdl-badge bg-[var(--accent-success-soft)]">
                                            {processo.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">
                                            Ver detalhes
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </GPDLLayout>
    );
}
```

---

## 🚀 Próximos passos

### **1. Criar páginas do Admin**
Você já tem as páginas em `resources/js/pages/Admin/`:
- Cargos.tsx
- Permissoes.tsx
- Regras.tsx
- Setores.tsx
- Solicitacoes.tsx
- Usuarios.tsx

Mas elas ainda usam o layout antigo. Atualize para `GPDLLayout`.

### **2. Migrar rotas do PHP**
Crie as rotas no `routes/web.php` para cada página.

### **3. Conectar com backend**
Faça as páginas buscarem dados reais da API.

### **4. Implementar permissões**
Configure o sistema de permissões no backend e ative na sidebar.

---

## 💡 Dicas

- **Navegação preserva estado**: Se você tem filtros, paginação, etc., use query params
- **Prefetch**: Use `prefetch` nos Links importantes: `<Link href="..." prefetch>`
- **Persistência**: O Inertia mantém scroll position automaticamente
- **Validação**: Use Zod + react-hook-form para formulários robustos

---

## ❓ Dúvidas comuns

**Q: Como faço para passar dados do backend para a página?**
```php
// No controller
return Inertia::render('processos/Ativos', [
    'processos' => Processo::all(),
]);

// No componente
export default function ProcessosAtivos({ processos }) {
    // processos está disponível aqui
}
```

**Q: Como atualizar apenas parte dos dados sem recarregar tudo?**
```tsx
import { router } from '@inertiajs/react';

// Atualiza apenas alguns dados
router.reload({ only: ['processos'] });
```

**Q: Como fazer redirect após salvar?**
```tsx
import { router } from '@inertiajs/react';

router.post('/processos', data, {
    onSuccess: () => {
        router.visit('/processos?view=ativos');
    },
});
```

---

Está tudo pronto para você começar a migrar as páginas! 🎉
