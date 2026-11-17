import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input
} from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icons';

export type BadgeTone =
  'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'sky' | 'teal' | 'violet';

/**
 * `status`  situação de um registro, com texto regular  (● Ativo)
 * `tag`     classificação, com texto menor e em negrito (Intermunicipal)
 */
export type BadgeVariant = 'status' | 'tag';

const BASE =
  'inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 leading-none';

const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  success: { box: 'border-brand-500/20 bg-brand-50 text-brand-600', dot: 'bg-brand-500' },
  warning: { box: 'border-warning-500/20 bg-warning-50 text-warning-700', dot: 'bg-warning-500' },
  danger: {
    box: 'border-critical-600/20 bg-critical-50 text-critical-700',
    dot: 'bg-critical-600'
  },
  info: { box: 'border-info-500/20 bg-info-50 text-info-700', dot: 'bg-info-500' },
  neutral: { box: 'border-zinc-200 bg-zinc-100 text-zinc-600', dot: 'bg-zinc-400' },
  sky: { box: 'border-tag-sky/20 bg-tag-sky/8 text-tag-sky', dot: 'bg-tag-sky' },
  teal: { box: 'border-tag-teal/20 bg-tag-teal/8 text-tag-teal', dot: 'bg-tag-teal' },
  violet: { box: 'border-tag-violet/20 bg-tag-violet/8 text-tag-violet', dot: 'bg-tag-violet' }
};

const VARIANTS: Record<BadgeVariant, string> = {
  status: 'text-[11px]',
  tag: 'text-[10px] font-semibold'
};

/**
 * Selo de situação ou de classificação.
 *
 * Uso:
 *   <app-badge tone="success" dot>Ativo</app-badge>
 *   <app-badge tone="sky" variant="tag">Intermunicipal</app-badge>
 *   <app-badge tone="warning" variant="tag" icon="alert-triangle">4 CNH vencendo</app-badge>
 *   <app-badge tone="success" variant="tag" mono>01-042</app-badge>
 *
 * A cor nunca é a única pista: o texto sempre diz a situação.
 */
@Component({
  selector: 'app-badge',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `
    @if (dot()) {
      <span class="size-1.5 shrink-0 rounded-full" [class]="dotClass()" aria-hidden="true"></span>
    }
    @if (icon(); as name) {
      <app-icon [name]="name" [size]="12" [strokeWidth]="2.25" />
    }
    <ng-content />
  `
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
  readonly variant = input<BadgeVariant>('status');

  /** Bolinha colorida antes do texto, usada nos selos de situação. */
  readonly dot = input(false, { transform: booleanAttribute });

  /** Ícone antes do texto. */
  readonly icon = input<IconName>();

  /** Fonte monoespaçada, para códigos e prefixos. */
  readonly mono = input(false, { transform: booleanAttribute });

  protected readonly dotClass = computed(() => TONES[this.tone()].dot);

  protected readonly classes = computed(
    () =>
      `${BASE} ${TONES[this.tone()].box} ${VARIANTS[this.variant()]}${this.mono() ? ' font-mono' : ''}`
  );
}
