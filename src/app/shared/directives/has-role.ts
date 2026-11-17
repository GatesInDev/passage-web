import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/user.model';

/**
 * Mostra um trecho da tela só para os perfis informados.
 *
 * Uso:
 *   <button *appHasRole="'ADMIN'" app-button type="button">Nova Empresa</button>
 *
 *   <button *appHasRole="can.routeManage" app-icon-button icon="pencil" label="Editar rota"></button>
 *
 * `can` é o `PERMISSIONS` de `shared/domain/permissions.ts`, exposto pelo
 * componente (`protected readonly can = PERMISSIONS`): as listas de lá
 * espelham os `@PreAuthorize` da API.
 *
 * Isto é conveniência de interface — evita oferecer um botão que
 * responderia 403. A proteção de verdade é do `roleGuard` nas rotas e
 * da própria API. Regras que dependem do dado (o gestor só altera
 * rotas da própria empresa) também ficam a cargo da API.
 */
@Directive({ selector: '[appHasRole]' })
export class HasRole {
  readonly roles = input.required<UserRole | readonly UserRole[]>({ alias: 'appHasRole' });

  private readonly auth = inject(AuthService);
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  private rendered = false;

  constructor() {
    effect(() => {
      const roles = this.roles();
      const current = this.auth.user()?.role;

      const allowed =
        current !== undefined &&
        (typeof roles === 'string' ? roles === current : roles.includes(current));

      if (allowed && !this.rendered) {
        this.container.createEmbeddedView(this.template);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.container.clear();
        this.rendered = false;
      }
    });
  }
}
