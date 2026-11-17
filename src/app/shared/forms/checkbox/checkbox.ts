import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Icon } from '../../components/icon/icon';

/**
 * Caixa de seleção. O texto projetado é o rótulo.
 *
 * Funciona dentro de um formulário ou solta, com `[(checked)]`.
 *
 * Uso:
 *   <app-checkbox formControlName="isAccessible">Veículo acessível para PCD</app-checkbox>
 *   <app-checkbox [(checked)]="onlyActive">Somente ativos</app-checkbox>
 *
 * Sem texto visível (em uma coluna de seleção, por exemplo), informe
 * `ariaLabel`.
 */
@Component({
  selector: 'app-checkbox',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true }],
  host: { class: 'inline-flex' },
  template: `
    <label
      class="inline-flex items-center gap-2 text-xs text-carbon-900"
      [class]="isDisabled() ? 'cursor-not-allowed text-zinc-500' : 'cursor-pointer'"
    >
      <span class="relative flex size-3.5 shrink-0 items-center justify-center">
        <input
          #control
          type="checkbox"
          class="peer absolute inset-0 size-full cursor-[inherit] appearance-none rounded-xs border
                 border-zinc-500 bg-white transition-colors checked:border-carbon-900
                 indeterminate:border-carbon-900 hover:border-carbon-900 focus-visible:outline-2
                 focus-visible:outline-offset-2 focus-visible:outline-brand-500
                 disabled:border-zinc-300 disabled:bg-zinc-100"
          [checked]="checked()"
          [indeterminate]="indeterminate()"
          [disabled]="isDisabled()"
          [attr.aria-label]="ariaLabel() || null"
          (change)="onToggle(control.checked)"
          (blur)="onTouched()"
        />
        <span class="pointer-events-none relative hidden text-carbon-900 peer-checked:flex">
          <app-icon name="check" [size]="11" [strokeWidth]="3.25" />
        </span>
        <span
          class="pointer-events-none absolute hidden h-0.5 w-2 rounded-full bg-carbon-900
                 peer-indeterminate:block"
        ></span>
      </span>

      <span class="empty:hidden"><ng-content /></span>
    </label>
  `
})
export class Checkbox implements ControlValueAccessor {
  readonly checked = model(false);

  /** Estado "parcial": parte dos itens de um grupo está marcada. */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  readonly disabled = input(false, { transform: booleanAttribute });

  /** Nome acessível para quando não houver texto visível. */
  readonly ariaLabel = input('');

  private readonly disabledByForm = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checked.set(value === true);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  protected onToggle(checked: boolean): void {
    this.checked.set(checked);
    this.onChange(checked);
  }
}
