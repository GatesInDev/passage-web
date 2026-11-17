import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../core/auth/auth.service';
import { AuthenticatedUser, UserRole } from '../../core/models/user.model';
import { PERMISSIONS } from '../domain/permissions';
import { HasRole } from './has-role';

@Component({
  imports: [HasRole],
  template: `
    <button *appHasRole="'ADMIN'" id="create">Nova Empresa</button>
    <button *appHasRole="can.routeManage" id="edit">Editar rota</button>
  `
})
class Host {
  readonly can = PERMISSIONS;
}

describe('HasRole', () => {
  const user = signal<AuthenticatedUser | null>(null);

  const login = (role: UserRole) =>
    user.set({ id: '1', email: 'a@passage.com.br', role, companyUuid: null });

  async function setup() {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { user: user.asReadonly() } }]
    });

    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const ids = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).map(b => b.id);

    return { fixture, ids };
  }

  beforeEach(() => user.set(null));

  it('não mostra nada para quem não está autenticado', async () => {
    expect((await setup()).ids()).toEqual([]);
  });

  it('mostra só o que o perfil pode', async () => {
    login('FLEET_MANAGER');

    expect((await setup()).ids()).toEqual(['edit']);
  });

  it('acompanha a troca de sessão', async () => {
    const { fixture, ids } = await setup();

    login('ADMIN');
    await fixture.whenStable();
    expect(ids()).toEqual(['create', 'edit']);

    user.set(null);
    await fixture.whenStable();
    expect(ids()).toEqual([]);
  });
});
