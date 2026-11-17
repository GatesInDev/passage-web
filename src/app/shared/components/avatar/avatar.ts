import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarTone = 'neutral' | 'brand';
export type AvatarSize = 'sm' | 'md';

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-full font-bold uppercase leading-none select-none';

const TONES: Record<AvatarTone, string> = {
  neutral: 'border border-zinc-300 bg-zinc-200 text-zinc-600',
  brand: 'bg-brand-500 text-white'
};

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-[22px] text-[9px]',
  md: 'size-[26px] text-[10px]'
};

/** Iniciais das duas primeiras palavras do nome: "Marcos Aurélio Santos" → "MA". */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

/**
 * Círculo com as iniciais de uma pessoa.
 *
 * Uso:
 *   <app-avatar name="Marcos Aurélio Santos" />
 *   <app-avatar name="João Ribeiro" tone="brand" />
 *
 * É decorativo: o nome completo deve aparecer ao lado ou no rótulo
 * acessível do elemento que o contém.
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.title]': 'name()',
    'aria-hidden': 'true'
  },
  template: `{{ initials() }}`
})
export class Avatar {
  readonly name = input.required<string>();
  readonly tone = input<AvatarTone>('neutral');
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() => initialsOf(this.name()));

  protected readonly classes = computed(
    () => `${BASE} ${TONES[this.tone()]} ${SIZES[this.size()]}`
  );
}
