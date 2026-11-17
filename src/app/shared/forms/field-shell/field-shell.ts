import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FieldAppearance } from '../field-control';

const LABELS: Record<FieldAppearance, string> = {
  form: 'text-[10px] font-semibold uppercase leading-3 text-zinc-600',
  filter: 'text-[10px] leading-3 text-zinc-500'
};

/**
 * Moldura comum dos campos: rótulo em cima, controle no meio e, embaixo,
 * a mensagem de erro ou o texto de apoio.
 *
 * É uma peça interna de `app-text-field` e `app-select-field`. Use-a
 * diretamente só para dar o mesmo acabamento a um controle próprio.
 */
@Component({
  selector: 'app-field-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-w-0 flex-col gap-1' },
  template: `
    @if (label()) {
      <label [class]="labelClass[appearance()]" [attr.for]="controlId()">
        {{ label() }}
        @if (required()) {
          <span class="text-critical-600" aria-hidden="true">*</span>
        }
      </label>
    }

    <ng-content />

    @if (error()) {
      <p class="text-[11px] leading-4 text-critical-700" role="alert" [id]="controlId() + '-error'">
        {{ error() }}
      </p>
    } @else if (hint()) {
      <p class="text-[11px] leading-4 text-zinc-500" [id]="controlId() + '-hint'">{{ hint() }}</p>
    }
  `
})
export class FieldShell {
  readonly controlId = input.required<string>();
  readonly label = input('');
  readonly required = input(false);
  readonly error = input('');
  readonly hint = input('');
  readonly appearance = input<FieldAppearance>('form');

  protected readonly labelClass = LABELS;
}
