import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

/** Libera a rota apenas para usuários autenticados. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Guarda o destino para retomar a navegação após o login.
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url }
  });
};

/**
 * Libera a rota apenas para os papéis informados.
 *
 * Uso: `canActivate: [authGuard, roleGuard('ADMIN', 'TICKET_SELLER')]`
 */
export const roleGuard =
  (...roles: UserRole[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.hasAnyRole(...roles) ? true : router.createUrlTree(['/login']);
  };
