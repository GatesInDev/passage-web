import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { UserRole } from '../../../core/models/user.model';
import { Avatar } from '../avatar/avatar';
import { Icon } from '../icon/icon';

export interface NavItem {
  label: string;
  /** Rota do módulo. */
  link: string;
  /** Considera ativo só quando a URL for exatamente `link`. */
  exact?: boolean;
  /**
   * Perfis que enxergam o item. Sem a lista, aparece para todos.
   *
   * Use as mesmas regras dos `@PreAuthorize` da API — veja `PERMISSIONS`
   * em `shared/domain/permissions.ts`.
   */
  roles?: readonly UserRole[];
}

/**
 * Barra superior da aplicação: marca, módulos e conta do usuário.
 *
 * O conteúdo projetado fica à direita, antes do avatar — no protótipo,
 * o botão "Log de Auditoria".
 *
 * Uso:
 *   <app-topbar
 *     version="v2.4.1"
 *     [items]="modules"
 *     [role]="auth.user()?.role ?? null"
 *     [userName]="auth.user()?.email ?? ''"
 *     (userClick)="logout()"
 *   >
 *     <button app-button variant="dark" size="sm" type="button">Log de Auditoria</button>
 *   </app-topbar>
 *
 * Esconder um módulo aqui é só conveniência de interface: quem garante
 * o acesso é o `roleGuard` da rota e, no fim, a própria API.
 */
@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, Avatar, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './topbar.html'
})
export class Topbar {
  readonly brand = input('Passage');
  readonly version = input('');

  readonly items = input<readonly NavItem[]>([]);

  /** Perfil do usuário logado, usado para filtrar os módulos. */
  readonly role = input<UserRole | null>(null);

  /** Nome exibido como iniciais no avatar. Vazio esconde o avatar. */
  readonly userName = input('');

  /** Clique no botão de menu, à esquerda da marca. */
  readonly menuClick = output<void>();

  /** Clique no avatar do usuário. */
  readonly userClick = output<void>();

  protected readonly visibleItems = computed(() => {
    const role = this.role();

    return this.items().filter(
      item => item.roles === undefined || (role !== null && item.roles.includes(role))
    );
  });
}
