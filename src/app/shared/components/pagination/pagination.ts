import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { Icon } from '../icon/icon';

/** Quantas páginas numeradas aparecem ao mesmo tempo. */
const WINDOW = 5;

const BUTTON =
  'inline-flex h-[22px] min-w-[26px] cursor-pointer items-center justify-center rounded-sm border px-1 ' +
  'text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 ' +
  'focus-visible:outline-brand-500 disabled:cursor-default';

const IDLE =
  'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-carbon-900 ' +
  'disabled:bg-zinc-100 disabled:text-zinc-400';

const CURRENT = 'border-brand-600 bg-brand-500 font-bold text-white';

/** Total de páginas; nunca menos que uma, mesmo sem registros. */
export function pageCountOf(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
}

/**
 * Recorta de uma lista as linhas de uma página.
 *
 * As listagens da Passage API (`GET /routes`, `/tickets`, `/users`)
 * devolvem todos os registros de uma vez, então a paginação é feita no
 * navegador:
 *
 *   readonly visible = computed(() => paginate(this.filtered(), this.page(), 10));
 */
export function paginate<T>(rows: readonly T[], page: number, pageSize: number): T[] {
  const current = Math.min(Math.max(1, page), pageCountOf(rows.length, pageSize));
  const start = (current - 1) * pageSize;

  return rows.slice(start, start + pageSize);
}

/**
 * Rodapé de paginação das listagens.
 *
 * Uso:
 *   <app-pagination [(page)]="page" [pageSize]="10" [total]="filtered().length" itemLabel="rotas" />
 */
@Component({
  selector: 'app-pagination',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-[7px]'
  },
  template: `
    <p class="text-[11px] text-zinc-500" aria-live="polite">
      Página {{ current() }} de {{ pageCount() }} · {{ total() }} {{ itemLabel() }}
    </p>

    <nav class="flex items-center gap-1" aria-label="Paginação">
      <button
        type="button"
        aria-label="Primeira página"
        [class]="button + ' ' + idle"
        [disabled]="current() === 1"
        (click)="go(1)"
      >
        <app-icon name="chevrons-left" [size]="12" />
      </button>
      <button
        type="button"
        aria-label="Página anterior"
        [class]="button + ' ' + idle"
        [disabled]="current() === 1"
        (click)="go(current() - 1)"
      >
        <app-icon name="chevron-left" [size]="12" />
      </button>

      @for (number of pages(); track number) {
        <button
          type="button"
          [class]="button + ' ' + (number === current() ? currentPage : idle)"
          [attr.aria-label]="'Página ' + number"
          [attr.aria-current]="number === current() ? 'page' : null"
          (click)="go(number)"
        >
          {{ number }}
        </button>
      }

      <button
        type="button"
        aria-label="Próxima página"
        [class]="button + ' ' + idle"
        [disabled]="current() === pageCount()"
        (click)="go(current() + 1)"
      >
        <app-icon name="chevron-right" [size]="12" />
      </button>
      <button
        type="button"
        aria-label="Última página"
        [class]="button + ' ' + idle"
        [disabled]="current() === pageCount()"
        (click)="go(pageCount())"
      >
        <app-icon name="chevrons-right" [size]="12" />
      </button>
    </nav>
  `
})
export class Pagination {
  /** Página atual, começando em 1. */
  readonly page = model(1);

  readonly pageSize = input(10);

  /** Total de registros, depois dos filtros. */
  readonly total = input.required<number>();

  /** Nome dos registros no plural: "5 itens", "6 rotas". */
  readonly itemLabel = input('itens');

  protected readonly button = BUTTON;
  protected readonly idle = IDLE;
  protected readonly currentPage = CURRENT;

  protected readonly pageCount = computed(() => pageCountOf(this.total(), this.pageSize()));

  /** Um filtro pode encurtar a lista e deixar a página atual além do fim. */
  protected readonly current = computed(() => Math.min(Math.max(1, this.page()), this.pageCount()));

  protected readonly pages = computed(() => {
    const count = this.pageCount();
    const size = Math.min(WINDOW, count);
    const first = Math.min(Math.max(1, this.current() - Math.floor(size / 2)), count - size + 1);

    return Array.from({ length: size }, (_, offset) => first + offset);
  });

  protected go(page: number): void {
    const target = Math.min(Math.max(1, page), this.pageCount());

    if (target !== this.page()) {
      this.page.set(target);
    }
  }
}
