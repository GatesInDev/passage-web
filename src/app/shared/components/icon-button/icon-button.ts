import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input
} from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icons';

export type IconButtonTone = 'neutral' | 'danger';

const BASE =
  'inline-flex h-[22px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded-sm border ' +
  'bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 ' +
  'focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50 ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-50';

const TONES: Record<IconButtonTone, string> = {
  neutral:
    'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 hover:text-carbon-900',
  danger: 'border-critical-200 text-critical-600 hover:border-critical-300 hover:bg-critical-50'
};

/**
 * Botão compacto só com ícone — as ações de cada linha de tabela
 * (visualizar, editar, remover).
 *
 * `label` é obrigatório: vira o nome acessível e a dica ao passar o mouse.
 *
 * Uso:
 *   <button app-icon-button icon="pencil" label="Editar rota" type="button"></button>
 *   <button app-icon-button icon="minus-circle" tone="danger" label="Remover rota" type="button"></button>
 */
@Component({
  selector: 'button[app-icon-button], a[app-icon-button]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null'
  },
  template: `<app-icon [name]="icon()" [size]="13" />`
})
export class IconButton {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly tone = input<IconButtonTone>('neutral');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => `${BASE} ${TONES[this.tone()]}`);
}
