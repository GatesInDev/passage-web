import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  input,
  signal,
  viewChild
} from '@angular/core';

import { Icon } from '../../components/icon/icon';
import { FieldControl } from '../field-control';
import { FieldShell } from '../field-shell/field-shell';
import { cleanCnpj, cleanCpf, formatCnpj, formatCpf } from '../masks';

export type TextFieldType =
  'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date' | 'datetime-local';

/**
 * `cpf`        mostra 123.456.789-09, guarda 12345678909
 * `cnpj`       mostra 12.345.678/0001-95, guarda 12345678000195
 * `uppercase`  converte para maiúsculas — UF, placa, código de rota
 */
export type TextFieldFormat = 'cpf' | 'cnpj' | 'uppercase';

interface Formatter {
  /** Do que o usuário digitou para o valor do formulário. */
  parse(text: string): string;
  /** Do valor do formulário para o que aparece no campo. */
  display(raw: string): string;
  /** Caracteres que fazem parte do valor (o resto é pontuação da máscara). */
  rawChar: RegExp;
}

const FORMATTERS: Record<TextFieldFormat, Formatter> = {
  cpf: { parse: cleanCpf, display: formatCpf, rawChar: /\d/ },
  cnpj: { parse: cleanCnpj, display: formatCnpj, rawChar: /[A-Za-z0-9]/ },
  uppercase: { parse: text => text.toUpperCase(), display: raw => raw, rawChar: /[\s\S]/ }
};

/** Posição do cursor logo depois do enésimo caractere de valor. */
function caretAfter(text: string, rawCount: number, rawChar: RegExp): number {
  if (rawCount === 0) {
    return 0;
  }

  let seen = 0;

  for (let index = 0; index < text.length; index++) {
    if (rawChar.test(text[index]) && ++seen === rawCount) {
      return index + 1;
    }
  }

  return text.length;
}

/**
 * Campo de texto com rótulo, validação e mensagem de erro.
 *
 * Uso:
 *   <app-text-field label="Razão Social" formControlName="corporateName" />
 *   <app-text-field label="CNPJ" format="cnpj" formControlName="documentId" />
 *   <app-text-field label="Distância (km)" type="number" formControlName="distanceKm" />
 *   <app-text-field label="Senha" type="password" formControlName="password" />
 *
 * O valor entregue ao formulário é texto — ou número (`null` quando
 * vazio) em `type="number"`. Com `format`, é sempre o valor limpo, sem a
 * pontuação da máscara, que é como a API espera.
 *
 * Em `type="password"` aparece o botão de mostrar e ocultar a senha.
 *
 * Fora de um formulário, para apenas exibir um dado:
 *   <app-text-field label="Capacidade total" [value]="capacity()" readonly />
 */
@Component({
  selector: 'app-text-field',
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
        <input
          #control
          [id]="inputId()"
          [type]="nativeType()"
          [class]="inputClass()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [attr.name]="name() || null"
          [attr.autocomplete]="autocomplete() || null"
          [attr.inputmode]="inputmode() || null"
          [attr.maxlength]="maxlength() ?? null"
          [attr.min]="min() ?? null"
          [attr.max]="max() ?? null"
          [attr.step]="step() ?? null"
          [attr.aria-required]="isRequired() ? 'true' : null"
          [attr.aria-invalid]="errorMessage() ? 'true' : null"
          [attr.aria-describedby]="describedBy()"
          (input)="onInput(control)"
          (blur)="markTouched()"
        />

        @if (type() === 'password') {
          <button
            type="button"
            class="absolute right-1 flex size-6 cursor-pointer items-center justify-center rounded-sm
                   text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-carbon-900
                   focus-visible:outline-2 focus-visible:outline-brand-500"
            [attr.aria-label]="revealed() ? 'Ocultar senha' : 'Mostrar senha'"
            [attr.aria-pressed]="revealed()"
            (click)="revealed.set(!revealed())"
          >
            <app-icon name="eye" [size]="14" />
          </button>
        }
      </div>
    </app-field-shell>
  `
})
export class TextField extends FieldControl<string | number> implements AfterViewInit {
  readonly type = input<TextFieldType>('text');
  readonly placeholder = input('');
  readonly format = input<TextFieldFormat>();

  /** Fonte monoespaçada, para códigos e documentos. */
  readonly mono = input(false, { transform: booleanAttribute });

  /** Só exibe o valor, sem permitir edição. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Valor exibido quando o campo não está ligado a um formulário —
   * um dado calculado, por exemplo: `[value]="capacity()" readonly`.
   */
  readonly fixedValue = input<string | number | null | undefined>(undefined, { alias: 'value' });

  readonly name = input('');
  readonly autocomplete = input('');
  readonly inputmode = input('');
  readonly maxlength = input<number>();
  readonly min = input<number | string>();
  readonly max = input<number | string>();
  readonly step = input<number | string>();

  protected readonly revealed = signal(false);

  private readonly control = viewChild<ElementRef<HTMLInputElement>>('control');

  protected readonly nativeType = computed(() =>
    this.type() === 'password' && this.revealed() ? 'text' : this.type()
  );

  protected readonly inputClass = computed(
    () =>
      this.controlClass() +
      (this.mono() ? ' font-mono' : '') +
      (this.type() === 'password' ? ' pr-8' : '')
  );

  constructor() {
    super();

    effect(() => {
      const value = this.fixedValue();

      if (value !== undefined) {
        this.writeValue(value);
      }
    });
  }

  protected override isReadonly(): boolean {
    return this.readonly();
  }

  /**
   * Do formulário para a tela.
   *
   * O texto é escrito direto no elemento, e só quando o valor vem do
   * formulário. Se o campo ficasse amarrado ao valor por binding, cada
   * tecla reescreveria o que o usuário está digitando — e um número
   * pela metade, como "12,", seria apagado no meio do caminho.
   */
  override writeValue(value: string | number | null): void {
    super.writeValue(value);
    this.render();
  }

  ngAfterViewInit(): void {
    // Cobre o valor inicial, caso ele chegue antes de o campo existir.
    this.render();
  }

  private render(): void {
    const element = this.control()?.nativeElement;

    if (element === undefined) {
      return;
    }

    const value = this.value();
    const text = value === null ? '' : String(value);
    const format = this.format();

    element.value = format ? FORMATTERS[format].display(text) : text;
  }

  protected onInput(element: HTMLInputElement): void {
    const format = this.format();

    if (format) {
      this.commit(this.applyFormat(element, FORMATTERS[format]));
    } else if (this.type() === 'number') {
      const parsed = element.valueAsNumber;
      this.commit(Number.isNaN(parsed) ? null : parsed);
    } else {
      this.commit(element.value);
    }
  }

  /** Reescreve o campo com a máscara, mantendo o cursor onde o usuário estava. */
  private applyFormat(element: HTMLInputElement, formatter: Formatter): string {
    const raw = formatter.parse(element.value);
    const text = formatter.display(raw);

    if (text !== element.value) {
      const caret = element.selectionStart ?? element.value.length;
      const rawBeforeCaret = formatter.parse(element.value.slice(0, caret)).length;

      element.value = text;

      const position = caretAfter(text, rawBeforeCaret, formatter.rawChar);
      element.setSelectionRange(position, position);
    }

    return raw;
  }
}
