import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  viewChildren
} from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  /** Quantidade exibida entre parênteses: "Empresas (5)". */
  count?: number;
  disabled?: boolean;
}

/**
 * Abas de seção, sublinhadas — as que ficam logo abaixo do cabeçalho
 * da página (Empresas / Ônibus, Dados Gerais / Assentos...).
 *
 * Uso:
 *   <app-tabs [tabs]="tabs" [(active)]="tab" label="Seções da frota" />
 *
 *   @switch (tab()) {
 *     @case ('companies') { ... }
 *     @case ('buses') { ... }
 *   }
 *
 * Teclado: setas esquerda/direita, Home e End percorrem as abas.
 */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block border-b border-zinc-200 bg-white' },
  template: `
    <div class="flex overflow-x-auto" role="tablist" [attr.aria-label]="label() || null">
      @for (tab of tabs(); track tab.id) {
        <button
          #tabButton
          type="button"
          role="tab"
          class="-mb-px flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap border-b-2 px-4 text-xs
                 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2
                 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50"
          [class]="
            tab.id === active()
              ? 'border-brand-500 font-semibold text-brand-600'
              : 'border-transparent text-zinc-500 hover:text-carbon-900'
          "
          [attr.aria-selected]="tab.id === active()"
          [attr.tabindex]="tab.id === active() ? 0 : -1"
          [disabled]="tab.disabled ?? false"
          (click)="active.set(tab.id)"
          (keydown)="onKeydown($event, $index)"
        >
          {{ tab.label }}
          @if (tab.count !== undefined) {
            <span class="ml-1">({{ tab.count }})</span>
          }
        </button>
      }
    </div>
  `
})
export class Tabs {
  readonly tabs = input.required<readonly TabItem[]>();

  /** `id` da aba selecionada. */
  readonly active = model.required<string>();

  /** Nome acessível do conjunto de abas. */
  readonly label = input('');

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const tabs = this.tabs();
    const last = tabs.length - 1;

    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let target: number;

    if (event.key in step) {
      target = this.nextEnabled(index, step[event.key]);
    } else if (event.key === 'Home') {
      target = this.nextEnabled(last, 1);
    } else if (event.key === 'End') {
      target = this.nextEnabled(0, -1);
    } else {
      return;
    }

    event.preventDefault();
    this.active.set(tabs[target].id);
    this.buttons()[target]?.nativeElement.focus();
  }

  /** Próxima aba habilitada a partir de `from`, dando a volta nas pontas. */
  private nextEnabled(from: number, direction: number): number {
    const tabs = this.tabs();
    let index = from;

    for (let visited = 0; visited < tabs.length; visited++) {
      index = (index + direction + tabs.length) % tabs.length;
      if (!tabs[index].disabled) {
        return index;
      }
    }

    return from;
  }
}
