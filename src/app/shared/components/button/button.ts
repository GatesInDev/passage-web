import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input
} from '@angular/core';

import { Spinner } from '../spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border ' +
  'transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-55 ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-55';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border-brand-600 bg-brand-500 font-semibold text-white hover:bg-brand-600 active:bg-brand-700',
  secondary:
    'border-zinc-300 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-carbon-900 active:bg-zinc-300',
  danger:
    'border-critical-700 bg-critical-600 font-semibold text-white hover:bg-critical-700 active:bg-critical-800',
  ghost: 'border-transparent bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-carbon-900',
  // Para uso sobre a barra superior escura.
  dark: 'border-carbon-700 bg-carbon-800 text-zinc-300 hover:bg-carbon-700 hover:text-white'
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-6 px-2 text-[11px]',
  md: 'h-7 px-3 text-xs',
  lg: 'h-9 px-4 text-[13px]'
};

/**
 * Botão da Passage. É aplicado sobre o elemento nativo, que mantém
 * toda a semântica e os atributos de sempre (`type`, `routerLink`...).
 *
 * Uso:
 *   <button app-button type="submit" [loading]="saving()">Salvar Alterações</button>
 *   <button app-button variant="secondary" type="button">Cancelar</button>
 *   <a app-button variant="ghost" routerLink="/rotas">Voltar</a>
 */
@Component({
  selector: 'button[app-button], a[app-button]',
  imports: [Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.disabled]': 'inactive() ? "" : null',
    '[attr.aria-disabled]': 'inactive() ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null'
  },
  template: `
    @if (loading()) {
      <app-spinner [size]="size() === 'lg' ? 16 : 13" />
    }
    <ng-content />
  `
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');

  /** Mostra o indicador de carregamento e bloqueia novos cliques. */
  readonly loading = input(false, { transform: booleanAttribute });

  readonly disabled = input(false, { transform: booleanAttribute });

  /** Ocupa toda a largura disponível. */
  readonly block = input(false, { transform: booleanAttribute });

  protected readonly inactive = computed(() => this.disabled() || this.loading());

  protected readonly classes = computed(
    () =>
      `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}${this.block() ? ' w-full' : ''}`
  );
}
