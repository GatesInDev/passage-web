import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output
} from '@angular/core';

import { Button } from '../button/button';
import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * Painel recolhível de filtros, acima das listagens.
 *
 * Os campos são projetados; use `appearance="filter"` neles para o
 * rótulo discreto do protótipo. O botão "Limpar" apenas emite `clear`:
 * quem zera os filtros é a página.
 *
 * Uso:
 *   <app-filter-panel (clear)="filters.reset()">
 *     <app-text-field appearance="filter" label="Código / Origem / Destino"
 *                     placeholder="Buscar rota..." formControlName="search" />
 *     <app-select-field appearance="filter" label="Status" placeholder="Todos"
 *                       [options]="statusOptions" formControlName="active" />
 *   </app-filter-panel>
 */
@Component({
  selector: 'app-filter-panel',
  imports: [Button, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block border-b border-zinc-200 bg-white' },
  template: `
    <button
      type="button"
      class="flex h-7 w-full cursor-pointer items-center gap-1.5 bg-panel px-4 text-[11px] font-medium
             text-zinc-600 transition-colors hover:text-carbon-900 focus-visible:outline-2
             focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="bodyId"
      (click)="expanded.set(!expanded())"
    >
      <app-icon
        name="chevron-down"
        class="transition-transform"
        [size]="12"
        [style.rotate]="expanded() ? null : '-90deg'"
      />
      {{ title() }}
    </button>

    <div
      class="flex flex-wrap items-end gap-2.5 border-t border-zinc-200 px-4 py-[11px]"
      [id]="bodyId"
      [hidden]="!expanded()"
    >
      <ng-content />

      @if (clearable()) {
        <button app-button variant="secondary" type="button" (click)="clear.emit()">
          {{ clearLabel() }}
        </button>
      }
    </div>
  `
})
export class FilterPanel {
  readonly title = input('Filtros Avançados');

  readonly expanded = model(true);

  /** Mostra o botão de limpar ao final dos campos. */
  readonly clearable = input(true, { transform: booleanAttribute });

  readonly clearLabel = input('Limpar');

  /** Pedido para zerar os filtros. */
  readonly clear = output<void>();

  protected readonly bodyId = `filter-panel-${nextId++}`;
}
