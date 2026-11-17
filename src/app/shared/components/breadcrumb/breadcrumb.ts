import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** Rota de destino. O último item, a página atual, não precisa de link. */
  link?: string;
}

/**
 * Faixa de trilha de navegação, logo abaixo da barra superior.
 *
 * O conteúdo projetado vai para o canto direito — no protótipo,
 * os selos de ambiente e de conexão.
 *
 * Uso:
 *   <app-breadcrumb [items]="[{ label: 'Passage', link: '/painel' }, { label: 'Rotas' }]">
 *     <app-badge tone="success" dot>Online</app-badge>
 *   </app-breadcrumb>
 */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex min-h-[30px] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-zinc-200 bg-white px-4 py-1'
  },
  template: `
    <nav aria-label="Trilha de navegação">
      <ol class="flex flex-wrap items-center gap-2 text-[11px]">
        @for (item of items(); track $index; let last = $last) {
          <li class="flex items-center gap-2">
            @if (last) {
              <span class="font-medium text-brand-600" aria-current="page">{{ item.label }}</span>
            } @else {
              @if (item.link) {
                <a
                  class="rounded-sm text-zinc-500 hover:text-carbon-900 hover:underline
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  [routerLink]="item.link"
                >
                  {{ item.label }}
                </a>
              } @else {
                <span class="text-zinc-500">{{ item.label }}</span>
              }
              <span class="text-zinc-400" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
    </nav>

    <div class="flex shrink-0 items-center gap-1.5 empty:hidden">
      <ng-content />
    </div>
  `
})
export class Breadcrumb {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
