import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output
} from '@angular/core';

import { Button } from '../button/button';
import { Modal } from './modal';

/**
 * Pergunta de confirmação antes de uma ação que o usuário não desfaz
 * sozinho — remover uma rota, cancelar uma passagem.
 *
 * Na Passage API toda exclusão é lógica: o registro é desativado e some
 * das listagens, mas continua no banco. Vale dizer isso na mensagem.
 *
 * `confirmed` não fecha a janela: a tela chama a API, usa `busy`
 * enquanto espera e fecha (`open.set(false)`) quando der certo. Assim,
 * se a API recusar, o usuário continua no mesmo lugar.
 *
 * Uso:
 *   <app-confirm-dialog
 *     title="Remover rota"
 *     message="A rota SP-CAM-001 será desativada e deixará de aparecer nas listagens."
 *     confirmLabel="Remover"
 *     danger
 *     [(open)]="removing"
 *     [busy]="deleting()"
 *     (confirmed)="remove()"
 *   />
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal width="26rem" [title]="title()" [locked]="busy()" [(open)]="open">
      <p>{{ message() }}</p>
      <ng-content />

      <ng-container modal-footer>
        <button
          app-button
          variant="secondary"
          type="button"
          [disabled]="busy()"
          (click)="open.set(false)"
        >
          {{ cancelLabel() }}
        </button>
        <button
          app-button
          type="button"
          [variant]="danger() ? 'danger' : 'primary'"
          [loading]="busy()"
          (click)="confirmed.emit()"
        >
          {{ confirmLabel() }}
        </button>
      </ng-container>
    </app-modal>
  `
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input('');

  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');

  /** Botão de confirmação em vermelho, para ações destrutivas. */
  readonly danger = input(false, { transform: booleanAttribute });

  /** Ação em andamento: trava a janela e mostra o indicador no botão. */
  readonly busy = input(false, { transform: booleanAttribute });

  readonly open = model(false);

  readonly confirmed = output<void>();
}
