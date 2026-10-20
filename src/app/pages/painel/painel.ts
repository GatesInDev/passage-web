import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { USER_ROLE_LABEL } from '../../core/models/user.model';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.html'
})
export class Painel {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  protected readonly roleLabel = computed(() => {
    const current = this.user();
    return current === null ? '' : USER_ROLE_LABEL[current.role];
  });

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
