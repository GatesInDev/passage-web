# Componentes compartilhados

Peças de interface usadas por mais de uma tela, feitas a partir do protótipo do Figma (Frotas & Empresas, Regras de Assentos, Rotas e Motoristas) e das regras da Passage API.

```ts
import { Button, DataTable, TextField } from '../../shared';
```

## O que tem aqui

| Pasta | Conteúdo |
|---|---|
| `components/` | Peças visuais: botões, selos, tabela, navegação, janelas e avisos |
| `forms/` | Campos de formulário, validadores, máscaras e leitura dos erros da API |
| `pipes/` | Formatação de CPF, CNPJ, duração, distância e moeda |
| `directives/` | `*appHasRole`, que mostra um trecho só para certos perfis |
| `domain/` | Rótulos dos enums e a tabela de permissões, copiados do backend |

## Componentes

### Estrutura da página

| Componente | Uso |
|---|---|
| `app-topbar` | Barra superior: marca, módulos (filtrados pelo perfil) e avatar |
| `app-breadcrumb` | Trilha de navegação; o conteúdo projetado vai para a direita |
| `app-page-header` | Título, descrição, selo de código e botões de ação |
| `app-tabs` | Abas sublinhadas, com contagem opcional |
| `app-filter-panel` | Painel recolhível de filtros, com o botão Limpar |
| `app-form-section` | Bloco de formulário com título e campos em grade |

```html
<app-topbar
  version="v2.4.1"
  [items]="modules"
  [role]="auth.user()?.role ?? null"
  [userName]="auth.user()?.email ?? ''"
  (userClick)="logout()"
/>

<app-breadcrumb [items]="[{ label: 'Passage', link: '/painel' }, { label: 'Rotas' }]">
  <app-badge tone="success" dot>Online</app-badge>
</app-breadcrumb>

<app-page-header title="Rotas" subtitle="Gestão de linhas e horários de operação">
  <button app-button variant="secondary" type="button">Exportar CSV</button>
  <button *appHasRole="can.routeManage" app-button type="button">Nova Rota</button>
</app-page-header>
```

### Ações e indicadores

| Componente | Uso |
|---|---|
| `button[app-button]`, `a[app-button]` | Botão: `variant` primary, secondary, danger, ghost ou dark; `size` sm, md ou lg; `loading` |
| `button[app-icon-button]` | Ação de linha, só com ícone; `label` é obrigatório (nome acessível) |
| `app-badge` | Selo: `tone`, `variant` status ou tag, `dot`, `icon`, `mono` |
| `app-status-badge` | Ativo / Inativo a partir do `isActive` da API (`feminine` para Ativa / Inativa) |
| `app-avatar` | Iniciais de uma pessoa |
| `app-icon` | Ícones em SVG; a lista está em `components/icon/icons.ts` |
| `app-spinner` | Indicador de carregamento |

### Dados

`app-data-table` recebe as colunas e as linhas. Quando a célula precisa de mais que texto, forneça um `<ng-template appCell>` com a `key` da coluna.

```ts
readonly columns: TableColumn<Route>[] = [
  { key: 'code', header: 'Código', style: 'code' },
  { key: 'name', header: 'Descrição / Trecho', style: 'strong' },
  { key: 'serviceScope', header: 'Tipo' },
  { key: 'status', header: 'Status' },
  { key: 'actions', header: 'Ações' }
];

readonly page = signal(1);
readonly visible = computed(() => paginate(this.filtered(), this.page(), 10));
```

```html
<app-data-table label="Rotas" [columns]="columns" [rows]="visible()" [loading]="loading()">
  <span table-summary>{{ filtered().length }} rotas encontradas</span>

  <ng-template appCell="serviceScope" [appCellOf]="visible()" let-row>
    <app-badge variant="tag" [tone]="scopeTone[row.serviceScope]">{{ scopeLabel[row.serviceScope] }}</app-badge>
  </ng-template>

  <ng-template appCell="status" [appCellOf]="visible()" let-row>
    <app-status-badge feminine [active]="row.isActive" />
  </ng-template>
</app-data-table>

<app-pagination itemLabel="rotas" [pageSize]="10" [total]="filtered().length" [(page)]="page" />
```

As listagens da API devolvem todos os registros de uma vez, então a paginação e os filtros são feitos no navegador — `paginate()` recorta a página.

Com `selectable`, `[(selection)]` guarda os `id` das linhas marcadas.

### Janelas e avisos

| Peça | Uso |
|---|---|
| `app-modal` | Janela modal; `[modal-footer]` marca o que vai para o rodapé |
| `app-confirm-dialog` | Confirmação de ação destrutiva, com `busy` enquanto a API responde |
| `ToastService` + `app-toast-outlet` | Avisos rápidos de sucesso, erro, atenção e informação |

`<app-toast-outlet />` precisa estar uma vez na raiz da aplicação (`app.html`) para os avisos aparecerem.

```ts
remove(): void {
  this.deleting.set(true);

  this.routes.delete(this.removing()!.id).subscribe({
    next: () => {
      this.removeOpen.set(false);
      this.toast.success('Rota removida.');
    },
    error: (error: HttpErrorResponse) => {
      this.deleting.set(false);
      this.toast.error(apiErrorMessage(error));
    }
  });
}
```

## Formulários

`app-text-field`, `app-select-field` e `app-checkbox` funcionam com `formControlName`, `[formControl]` e `[(ngModel)]`.

```html
<form [formGroup]="form" (ngSubmit)="save()" novalidate>
  <app-form-section title="Dados da empresa">
    <app-text-field class="sm:col-span-2" label="Razão Social" formControlName="corporateName" />
    <app-text-field label="CNPJ" format="cnpj" formControlName="documentId" />
    <app-select-field label="Escopo" placeholder="Selecione..." [options]="scopeOptions" formControlName="serviceScope" />
  </app-form-section>
</form>
```

- O asterisco de obrigatório vem do próprio `Validators.required`.
- A mensagem de erro aparece depois que o usuário mexe no campo ou quando a tela chama `form.markAllAsTouched()`.
- `format="cpf"` e `format="cnpj"` mostram a máscara, mas entregam ao formulário o valor limpo, que é como a API espera. `format="uppercase"` serve para UF, placa e códigos.
- Nos filtros, use `appearance="filter"` e dê a largura com uma classe (`class="w-52"`).

### Validadores

`PassageValidators` repete no navegador as validações dos DTOs da API:

| Validador | Regra | Onde a API usa |
|---|---|---|
| `cpf` | 11 dígitos com dígitos verificadores | `passengerDocument` |
| `cnpj` | 14 caracteres, numérico ou alfanumérico | `documentId` |
| `uf` | duas letras maiúsculas | `originState`, `destinationState` |
| `stateRegistration` | de 2 a 14 dígitos, ou `ISENTO` | `stateRegistration` |
| `positive` | maior que zero | `distanceKm`, `estimatedDurationMinutes`, `price` |
| `future` | data e hora no futuro | `departureDateTime` |

### Erros da API

A API responde no formato `ProblemDetail`. Em `forms/problem-detail.ts`:

- `apiErrorMessage(error)` devolve uma frase pronta para o usuário;
- `applyApiFieldErrors(form, error)` distribui os erros de validação (400) pelos campos, desde que os controles tenham os mesmos nomes do DTO.

```ts
error: (error: HttpErrorResponse) => {
  if (!applyApiFieldErrors(this.form, error)) {
    this.toast.error(apiErrorMessage(error));
  }
}
```

## Permissões

`PERMISSIONS` (`domain/permissions.ts`) copia os `@PreAuthorize` dos controllers. Use com `*appHasRole`, com o `roleGuard` e no `roles` dos itens da barra superior:

```ts
protected readonly can = PERMISSIONS;
```

```html
<button *appHasRole="can.ticketCancel" app-icon-button icon="minus-circle" tone="danger" label="Cancelar passagem"></button>
```

Esconder um botão é só conveniência: quem garante o acesso é a API. As regras que dependem do dado (o gestor só altera rotas da própria empresa) também ficam com ela.

## Cores e fontes

Os valores vêm do protótipo e estão em `src/tailwind.css`:

| Token | Uso |
|---|---|
| `brand-*` | Verde-oliva: botão primário, aba ativa, códigos |
| `carbon-*` | Barra superior e texto principal |
| `canvas`, `panel` | Fundo de formulário; cabeçalho de tabela e de painel |
| `warning-*`, `critical-*`, `info-*` | Situações: atenção, erro e informação |
| `tag-sky`, `tag-teal`, `tag-violet` | Tipos de rota |
| `zinc-*` (padrão do Tailwind) | Superfícies, bordas e texto secundário |

As fontes são Inter (texto) e JetBrains Mono (códigos e documentos), carregadas do Google Fonts em `src/index.html`.

## Convenções

- Componentes standalone, `OnPush`, com `input()`, `output()` e `model()`.
- O visual é feito com classes do Tailwind no template; variações ficam em mapas de classes no `.ts`.
- Nada aqui acessa `window` ou `document` durante a renderização, para funcionar com SSR.
- Testes ao lado do código (`*.spec.ts`), rodando com `npm test`.
