import {
  AfterContentInit,
  DestroyRef,
  Directive,
  DoCheck,
  booleanAttribute,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NgControl,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';

import { describeFieldError } from './field-errors';

/**
 * `form`    rótulo em maiúsculas e negrito, das telas de cadastro
 * `filter`  rótulo discreto e campo mais baixo, dos painéis de filtro
 */
export type FieldAppearance = 'form' | 'filter';

interface FieldState {
  touched: boolean;
  dirty: boolean;
  invalid: boolean;
  required: boolean;
  errors: ValidationErrors | null;
}

const UNBOUND: FieldState = {
  touched: false,
  dirty: false,
  invalid: false,
  required: false,
  errors: null
};

const CONTROL_BASE =
  'w-full min-w-0 rounded-sm border px-2 text-xs text-carbon-900 transition-colors ' +
  'placeholder:text-zinc-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ' +
  'disabled:bg-zinc-100 disabled:text-zinc-500';

const CONTROL_HEIGHT: Record<FieldAppearance, string> = {
  form: 'h-[30px]',
  filter: 'h-7'
};

const CONTROL_VALID =
  'border-zinc-300 hover:border-zinc-400 focus:border-brand-500 focus:ring-brand-500/25';

const CONTROL_INVALID = 'border-critical-600 focus:border-critical-600 focus:ring-critical-600/20';

let nextId = 0;

/**
 * Base dos campos de formulário da Passage (texto e seleção).
 *
 * Cuida do que é igual em todos eles:
 *   - a ligação com os formulários do Angular (`formControlName`,
 *     `[formControl]` ou `[(ngModel)]`), via ControlValueAccessor;
 *   - o asterisco de obrigatório, lido do próprio `Validators.required`;
 *   - a mensagem de erro, que só aparece depois que o usuário mexe no
 *     campo ou tenta enviar o formulário.
 */
@Directive()
export abstract class FieldControl<T> implements ControlValueAccessor, AfterContentInit, DoCheck {
  readonly label = input('');

  /** Texto de apoio sob o campo. Dá lugar à mensagem de erro. */
  readonly hint = input('');

  readonly appearance = input<FieldAppearance>('form');

  /** Força o asterisco quando a obrigatoriedade não vem de `Validators.required`. */
  readonly required = input(false, { transform: booleanAttribute });

  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Mensagens de erro próprias da tela, por chave de validação.
   * Ex.: `[messages]="{ pattern: 'Use o formato AAA-0A00.' }"`
   */
  readonly messages = input<Record<string, string>>({});

  /** `id` do controle nativo. Gerado automaticamente quando omitido. */
  readonly inputId = input(`field-${nextId++}`);

  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected readonly value = signal<T | null>(null);

  private readonly disabledByForm = signal(false);
  private readonly state = signal<FieldState>(UNBOUND);

  private boundControl: AbstractControl | null = null;
  private subscription?: Subscription;

  protected onChange: (value: T | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly isRequired = computed(() => this.required() || this.state().required);

  protected readonly errorMessage = computed(() => {
    const { invalid, touched, dirty, errors } = this.state();
    return invalid && (touched || dirty) ? describeFieldError(errors, this.messages()) : '';
  });

  /** Liga o controle ao texto que o explica, para leitores de tela. */
  protected readonly describedBy = computed(() => {
    if (this.errorMessage()) {
      return `${this.inputId()}-error`;
    }
    return this.hint() ? `${this.inputId()}-hint` : null;
  });

  protected readonly controlClass = computed(
    () =>
      `${CONTROL_BASE} ${CONTROL_HEIGHT[this.appearance()]} ` +
      `${this.isReadonly() ? 'bg-zinc-100' : 'bg-white'} ` +
      (this.errorMessage() ? CONTROL_INVALID : CONTROL_VALID)
  );

  constructor() {
    // Registrar-se aqui, em vez de prover NG_VALUE_ACCESSOR, permite
    // injetar o NgControl sem dependência circular.
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }

    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  ngAfterContentInit(): void {
    this.bind();
  }

  ngDoCheck(): void {
    // `[formControl]` pode trocar de controle depois de criado.
    this.bind();
  }

  writeValue(value: T | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  /** Valor alterado pelo usuário. */
  protected commit(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }

  /** Campos que só exibem um valor ganham fundo cinza. */
  protected isReadonly(): boolean {
    return false;
  }

  /**
   * Acompanha o estado do controle do formulário em um signal.
   *
   * `touched`, `invalid` e companhia não são reativos por conta própria;
   * sem isso, a mensagem de erro não apareceria quando a tela chamasse
   * `form.markAllAsTouched()` ao enviar.
   */
  private bind(): void {
    const control = this.ngControl?.control ?? null;

    if (control === this.boundControl) {
      return;
    }

    this.subscription?.unsubscribe();
    this.boundControl = control;

    if (control === null) {
      this.state.set(UNBOUND);
      return;
    }

    const sync = () =>
      this.state.set({
        touched: control.touched,
        dirty: control.dirty,
        invalid: control.invalid,
        required: control.hasValidator(Validators.required),
        errors: control.errors
      });

    sync();
    this.subscription = control.events.subscribe(sync);
  }
}
