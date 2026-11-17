import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

let nextId = 0;

const COLUMNS: Record<1 | 2 | 3 | 4, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
};

/**
 * Bloco de formulário com título, descrição e os campos em grade.
 *
 * Cada campo ocupa uma coluna; para um campo mais largo, use as classes
 * de grade do Tailwind nele (`class="sm:col-span-2"`, `class="col-span-full"`).
 *
 * Uso:
 *   <app-form-section title="Identificação do veículo" description="Dados básicos do ônibus">
 *     <app-text-field label="Prefixo" formControlName="code" />
 *     <app-text-field label="Placa" formControlName="licensePlate" />
 *   </app-form-section>
 */
@Component({
  selector: 'app-form-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    role: 'group',
    '[attr.aria-labelledby]': 'titleId'
  },
  template: `
    <div class="mb-2.5 flex flex-wrap items-baseline gap-x-2 border-b-2 border-zinc-200 pb-2">
      <h2 class="text-xs font-bold uppercase tracking-wider text-carbon-900" [id]="titleId">
        {{ title() }}
      </h2>
      @if (description()) {
        <p class="text-[11px] text-zinc-500">{{ description() }}</p>
      }
    </div>

    <div class="grid gap-x-3 gap-y-3.5" [class]="gridClass()">
      <ng-content />
    </div>
  `
})
export class FormSection {
  readonly title = input.required<string>();
  readonly description = input('');

  /** Colunas em telas largas; em telas estreitas a grade se ajusta. */
  readonly columns = input<1 | 2 | 3 | 4>(4);

  protected readonly titleId = `form-section-${nextId++}`;

  protected readonly gridClass = computed(() => COLUMNS[this.columns()]);
}
