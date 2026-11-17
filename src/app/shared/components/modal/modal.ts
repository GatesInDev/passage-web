import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  model,
  viewChild
} from '@angular/core';

import { IconButton } from '../icon-button/icon-button';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let nextId = 0;

/**
 * Janela modal.
 *
 * O conteúdo projetado é o corpo; o que tiver o atributo `modal-footer`
 * vai para o rodapé, alinhado à direita.
 *
 * Uso:
 *   <app-modal title="Nova empresa" [(open)]="creating">
 *     <form id="company-form" ...>...</form>
 *
 *     <ng-container modal-footer>
 *       <button app-button variant="secondary" type="button" (click)="creating.set(false)">Cancelar</button>
 *       <button app-button type="submit" form="company-form">Salvar</button>
 *     </ng-container>
 *   </app-modal>
 *
 * Ao abrir, o foco vai para o primeiro campo ou botão da janela e fica
 * preso nela (Tab dá a volta); Esc e o clique fora fecham; ao fechar, o
 * foco volta para onde estava.
 *
 * Os avisos do `ToastService` aparecem por cima da janela — dá para
 * mostrar o erro de uma gravação sem fechá-la.
 */
@Component({
  selector: 'app-modal',
  imports: [IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Fica sempre no DOM, só escondida: o conteúdo projetado precisa
      existir para a hidratação do SSR encontrá-lo.
    -->
    <div
      #overlay
      class="fixed inset-0 z-40 flex items-center justify-center bg-carbon-900/50 p-4"
      [hidden]="!open()"
      (click)="onOverlayClick($event, overlay)"
      (keydown)="onKeydown($event)"
    >
      <div
        #panel
        class="flex max-h-full w-full flex-col rounded-sm border border-zinc-300 bg-white text-carbon-900
               shadow-xl outline-none"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [style.max-width]="width()"
        [attr.aria-labelledby]="titleId"
      >
        <header
          class="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-panel px-4 py-2.5"
        >
          <h2 class="text-xs font-bold uppercase tracking-wider" [id]="titleId">{{ title() }}</h2>
          <button
            app-icon-button
            data-modal-close
            type="button"
            icon="x"
            label="Fechar"
            [disabled]="locked()"
            (click)="open.set(false)"
          ></button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-xs leading-5">
          <ng-content />
        </div>

        <footer
          class="flex shrink-0 flex-wrap justify-end gap-2 border-t border-zinc-200 bg-panel px-4 py-2.5
                 empty:hidden"
        ><ng-content select="[modal-footer]" /></footer>
      </div>
    </div>
  `
})
export class Modal {
  readonly title = input.required<string>();

  readonly open = model(false);

  /** Largura máxima, em qualquer unidade CSS. */
  readonly width = input('32rem');

  /**
   * Impede fechar por Esc, pelo X ou clicando fora — enquanto uma
   * gravação está em andamento, por exemplo.
   */
  readonly locked = input(false, { transform: booleanAttribute });

  protected readonly titleId = `modal-title-${nextId++}`;

  private readonly document = inject(DOCUMENT);

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  /** Onde o foco estava antes de abrir, para devolvê-lo ao fechar. */
  private opener: HTMLElement | null = null;

  private isShown = false;
  private pageOverflow = '';

  constructor() {
    // Só roda no navegador; no servidor não há foco nem rolagem a tratar.
    afterRenderEffect(() => {
      const open = this.open();

      if (open && !this.isShown) {
        this.onShown(this.panel().nativeElement);
      } else if (!open && this.isShown) {
        this.onHidden();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.isShown) {
        this.onHidden();
      }
    });
  }

  private onShown(panel: HTMLElement): void {
    this.isShown = true;
    this.opener = this.document.activeElement as HTMLElement | null;

    // A página por baixo não deve rolar enquanto a janela está aberta.
    this.pageOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';

    // O primeiro controle do conteúdo — ou, numa confirmação, o botão de
    // cancelar, que vem antes da ação definitiva.
    const first = this.focusable(panel).find(element => !element.hasAttribute('data-modal-close'));
    (first ?? panel).focus();
  }

  private onHidden(): void {
    this.isShown = false;
    this.document.body.style.overflow = this.pageOverflow;

    this.opener?.focus();
    this.opener = null;
  }

  private focusable(panel: HTMLElement): HTMLElement[] {
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();

      if (!this.locked()) {
        this.open.set(false);
      }
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const panel = this.panel().nativeElement;

    // Mantém o foco dentro da janela: do último controle volta ao primeiro.
    const controls = this.focusable(panel);
    const first = controls[0];
    const last = controls[controls.length - 1];
    const current = this.document.activeElement;

    if (first === undefined) {
      event.preventDefault();
    } else if (event.shiftKey && (current === first || current === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /** Um clique cujo alvo é a própria camada escura caiu fora da janela. */
  protected onOverlayClick(event: MouseEvent, overlay: HTMLElement): void {
    if (event.target === overlay && !this.locked()) {
      this.open.set(false);
    }
  }
}
