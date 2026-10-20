import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Anexa o token JWT às chamadas da Passage API e trata sessão expirada.
 *
 * Só intercepta requisições para a própria API: bibliotecas externas
 * (mapas, CEP, etc.) não devem receber o token do usuário.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApiCall = request.url.startsWith(environment.apiUrl);
  const isLogin = request.url.includes('/auth/login');
  const token = auth.token();

  const authorized =
    isApiCall && !isLogin && token !== null
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 significa token ausente, inválido ou expirado: derruba a sessão.
      // 403 é permissão insuficiente — o usuário segue logado.
      if (error.status === 401 && !isLogin) {
        auth.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
