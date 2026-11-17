import { Directive, TemplateRef, inject, input } from '@angular/core';

export interface TableCellContext<T> {
  /** A linha: `let-row`. */
  $implicit: T;
  /** Posição da linha na página atual: `let-index="index"`. */
  index: number;
}

/**
 * Conteúdo próprio para as células de uma coluna do `app-data-table`.
 *
 * Uso:
 *   <ng-template appCell="status" let-row>
 *     <app-status-badge [active]="row.isActive" />
 *   </ng-template>
 *
 * Para o template conhecer o tipo de `row`, passe as linhas em
 * `appCellOf` — o valor só serve à checagem de tipos:
 *
 *   <ng-template appCell="status" [appCellOf]="routes()" let-row>
 */
@Directive({ selector: 'ng-template[appCell]' })
export class TableCell<T = any> {
  /** `key` da coluna a que o template se aplica. */
  readonly key = input.required<string>({ alias: 'appCell' });

  readonly rows = input<readonly T[]>(undefined, { alias: 'appCellOf' });

  readonly template = inject<TemplateRef<TableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TableCell<T>,
    _context: unknown
  ): _context is TableCellContext<T> {
    return true;
  }
}
