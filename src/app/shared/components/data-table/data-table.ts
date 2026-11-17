import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  input,
  model
} from '@angular/core';

import { Checkbox } from '../../forms/checkbox/checkbox';
import { Icon } from '../icon/icon';
import { Spinner } from '../spinner/spinner';
import { TableCell, TableCellContext } from './table-cell';

/**
 * Aparência do texto da célula, conforme os padrões do protótipo:
 *
 * `text`    texto comum
 * `strong`  nome principal da linha (razão social, nome do motorista)
 * `mono`    dado técnico em fonte monoespaçada (CNPJ, distância)
 * `code`    identificador em destaque (código da rota, matrícula)
 * `muted`   informação secundária
 */
export type TableCellStyle = 'text' | 'strong' | 'mono' | 'code' | 'muted';

export interface TableColumn<T = any> {
  /** Identifica a coluna; por padrão, é também o campo lido da linha. */
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  /** Largura fixa, em qualquer unidade CSS: `'120px'`, `'8rem'`. */
  width?: string;
  style?: TableCellStyle;
  /** Texto da célula, quando não for simplesmente `row[key]`. */
  value?: (row: T) => string | number | null | undefined;
  /**
   * Deixa o texto quebrar em várias linhas. Por padrão cada célula fica
   * em uma linha só e, faltando espaço, a tabela rola para os lados.
   */
  wrap?: boolean;
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right tabular-nums'
} as const;

const STYLES: Record<TableCellStyle, string> = {
  text: '',
  strong: 'font-medium',
  mono: 'font-mono',
  code: 'font-mono font-bold text-brand-600',
  muted: 'text-zinc-500'
};

/**
 * Tabela de listagem: cabeçalho, linhas zebradas, seleção e estados de
 * carregando e vazio.
 *
 * As colunas são descritas em `columns`. Quando a célula precisa de mais
 * que texto (selo, botões de ação), forneça um `<ng-template appCell>`
 * com a `key` da coluna.
 *
 * Uso:
 *   <app-data-table label="Rotas" [columns]="columns" [rows]="page()" [loading]="loading()">
 *     <span table-summary>{{ routes().length }} rotas encontradas</span>
 *
 *     <ng-template appCell="status" [appCellOf]="page()" let-row>
 *       <app-status-badge [active]="row.isActive" feminine />
 *     </ng-template>
 *   </app-data-table>
 *
 * Com `selectable`, `[(selection)]` guarda os `id` das linhas marcadas.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, Checkbox, Icon, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block bg-white' },
  templateUrl: './data-table.html'
})
export class DataTable<T = any> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();

  /** Nome acessível da tabela. */
  readonly label = input('');

  /**
   * Identificador de cada linha. Por padrão é o campo `id`, que toda
   * entidade da Passage API tem.
   */
  readonly rowId = input<(row: T) => string>(row => String((row as { id?: unknown }).id));

  readonly loading = input(false, { transform: booleanAttribute });

  /** Mostra a coluna de caixas de seleção. */
  readonly selectable = input(false, { transform: booleanAttribute });

  /** Identificadores das linhas selecionadas. */
  readonly selection = model<readonly string[]>([]);

  readonly emptyMessage = input('Nenhum registro encontrado.');

  /** Orientação extra no estado vazio. Ex.: "Ajuste os filtros e tente de novo." */
  readonly emptyHint = input('');

  private readonly cells = contentChildren(TableCell);

  protected readonly templates = computed(() => {
    const byKey = new Map<string, TemplateRef<TableCellContext<T>>>();

    for (const cell of this.cells()) {
      byKey.set(cell.key(), cell.template);
    }

    return byKey;
  });

  protected readonly colspan = computed(() => this.columns().length + (this.selectable() ? 1 : 0));

  private readonly selected = computed(() => new Set(this.selection()));

  private readonly visibleIds = computed(() => this.rows().map(row => this.rowId()(row)));

  protected readonly allSelected = computed(() => {
    const ids = this.visibleIds();
    return ids.length > 0 && ids.every(id => this.selected().has(id));
  });

  protected readonly someSelected = computed(
    () => !this.allSelected() && this.visibleIds().some(id => this.selected().has(id))
  );

  protected readonly align = ALIGN;

  protected isSelected(row: T): boolean {
    return this.selected().has(this.rowId()(row));
  }

  protected toggleRow(row: T, checked: boolean): void {
    const id = this.rowId()(row);
    const others = this.selection().filter(selectedId => selectedId !== id);

    this.selection.set(checked ? [...others, id] : others);
  }

  /** Marca ou desmarca as linhas visíveis, sem mexer nas de outras páginas. */
  protected toggleAll(checked: boolean): void {
    const visible = new Set(this.visibleIds());
    const others = this.selection().filter(id => !visible.has(id));

    this.selection.set(checked ? [...others, ...visible] : others);
  }

  protected cellClass(column: TableColumn<T>): string {
    const wrap = column.wrap ? '' : 'whitespace-nowrap';

    return `${ALIGN[column.align ?? 'left']} ${STYLES[column.style ?? 'text']} ${wrap}`;
  }

  protected display(column: TableColumn<T>, row: T): string | number {
    const value = column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];

    // Travessão para dado ausente, como no protótipo.
    return value === null || value === undefined || value === '' ? '—' : (value as string | number);
  }
}
