import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { JwtClaims, LoginRequest, TokenResponse } from '../models/auth.model';
import { AuthenticatedUser, UserRole } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);

  private readonly _user = signal<AuthenticatedUser | null>(this.restoreSession());

  /** Usuário da sessão corrente, ou `null` quando anônimo. */
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap(response => this.startSession(response.accessToken)));
  }

  logout(): void {
    this.storage.clear();
    this._user.set(null);
  }

  /** Verifica se o usuário da sessão possui ao menos um dos papéis. */
  hasAnyRole(...roles: UserRole[]): boolean {
    const current = this._user();
    return current !== null && roles.includes(current.role);
  }

  token(): string | null {
    return this.storage.read();
  }

  private startSession(token: string): void {
    this.storage.write(token);
    this._user.set(this.toUser(token));
  }

  /** Recupera a sessão de um token já persistido, se ainda for válido. */
  private restoreSession(): AuthenticatedUser | null {
    const token = this.storage.read();
    return token === null ? null : this.toUser(token);
  }

  private toUser(token: string): AuthenticatedUser | null {
    const claims = this.decode(token);

    if (claims === null || this.isExpired(claims)) {
      this.storage.clear();
      return null;
    }

    return {
      id: claims.userId,
      email: claims.sub,
      // O Spring Security envia "ROLE_ADMIN"; a interface usa "ADMIN".
      role: claims.role.replace(/^ROLE_/, '') as UserRole,
      companyUuid: claims.companyUuid
    };
  }

  /**
   * Lê o conteúdo do JWT sem validar a assinatura.
   *
   * A validação real é responsabilidade da API — aqui o objetivo é
   * apenas saber quem está logado e até quando, para evitar uma
   * requisição que já se sabe que falharia.
   */
  private decode(token: string): JwtClaims | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized);

      return JSON.parse(decoded) as JwtClaims;
    } catch {
      return null;
    }
  }

  private isExpired(claims: JwtClaims): boolean {
    return claims.exp * 1000 <= Date.now();
  }
}
