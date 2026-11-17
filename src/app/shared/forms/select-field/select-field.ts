import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Icon } from '../../components/icon/icon';
import { FieldControl } from '../field-control';
import { FieldShell } from '../field-shell/field-shell';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Campo de seleção com rótulo, validação e mensagem de erro.
 *
 * O valor entregue ao formulário é o `value` da opção, do tipo que for
 * (texto, número, booleano, objeto) — não o texto do `<option>`.
 *
 * `placeholder` vira uma primeira opção que vale `null`: "Selecione..."
 * em um cadastro, "Todos" em um filtro.
 *
 * Uso:
 *   <app-select-field label="Escopo" placeholder="Selecione..."
 *                     [options]="scopeOptions" formControlName="serviceScope" />
 *
 *   <app-select-field appearance="filter" label="Status" placeholder="Todos"
 *                     [options]="[{ value: true, label: 'Ativo' }, { value: false, label: 'Inativo' }]"
 *                     formControlName="isActive" />
 */
@Component({
  selector: 'app-select-field',
  imports: [FieldShell, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <app-field-shell
      [controlId]="inputId()"
      [label]="label()"
      [required]="isRequired()"
      [error]="errorMessage()"
      [hint]="hint()"
      [appearance]="appearance()"
    >
      <div class="relative flex items-center">
        <select
          #control
          class="cursor-pointer appearance-none pr-7"
          [id]="inputId()"
          [class]="controlClass()"
          [disabled]="isDisabled()"
          [attr.aria-required]="isRequired() ? 'true' : null"
          [attr.aria-invalid]="errorMessage() ? 'true' : null"
          [attr.aria-describedby]="describedBy()"
          (change)="onSelect(control.value)"
          (blur)="markTouched()"
        >
          <!--
            Sem valor escolhido, o campo aparece em branco em vez de fingir
            que a primeira opção está selecionada.

            O atributo selected repete a propriedade para a opção certa já
            vir marcada no HTML gerado pelo servidor (SSR).
          -->
          @if (placeholder() !== '' || selectedIndex() === -1) {
            <option
              value=""
              [selected]="selectedIndex() === -1"
              [attr.selected]="selectedIndex() === -1 ? '' : null"
              [hidden]="placeholder() === ''"
            >
              {{ placeholder() }}
            </option>
          }

          @for (option of options(); track $index) {
            <option
              [value]="$index"
              [selected]="$index === selectedIndex()"
              [attr.selected]="$index === selectedIndex() ? '' : null"
              [disabled]="option.disabled ?? false"
            >
              {{ option.label }}
            </option>
          }
        </select>

        <app-icon
          name="chevron-down"
          class="pointer-events-none absolute right-2 text-zinc-500"
          [size]="14"
        />
      </div>
    </app-field-shell>
  `
})
export class SelectField<T = string> extends FieldControl<T> {
  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly placeholder = input('');

  protected readonly selectedIndex = computed(() => {
    const value = this.value();
    return this.options().findIndex(option => Object.is(option.value, value));
  });

  /** As opções são identificadas pela posição na lista. */
  protected onSelect(index: string): void {
    this.commit(index === '' ? null : this.options()[Number(index)].value);
  }
}
