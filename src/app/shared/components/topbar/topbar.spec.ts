import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserRole } from '../../../core/models/user.model';
import { PERMISSIONS } from '../../domain/permissions';
import { NavItem, Topbar } from './topbar';

@Component({
  imports: [Topbar],
  template: `<app-topbar userName="Ana Paula Rodrigues" [items]="items" [role]="role()" />`
})
class Host {
  readonly role = signal<UserRole | null>(null);

  readonly items: NavItem[] = [
    { label: 'Empresas', link: '/empresas', roles: PERMISSIONS.companyView },
    { label: 'Rotas', link: '/rotas' },
    { label: 'Passagens', link: '/passagens', roles: PERMISSIONS.ticketList }
  ];
}

describe('Topbar', () => {
  async function setup(role: UserRole | null) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.role.set(role);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const links = () =>
      Array.from(element.querySelectorAll('nav a')).map(a => a.textContent?.trim());

    return { fixture, element, links };
  }

  it('mostra só os módulos sem restrição para quem não tem perfil', async () => {
    const { links } = await setup(null);

    expect(links()).toEqual(['Rotas']);
  });

  it('filtra os módulos pelo perfil, como os @PreAuthorize da API', async () => {
    expect((await setup('FLEET_MANAGER')).links()).toEqual(['Empresas', 'Rotas']);
  });

  it('o bilheteiro vê passagens, mas não empresas', async () => {
    expect((await setup('TICKET_SELLER')).links()).toEqual(['Rotas', 'Passagens']);
  });

  it('mostra as iniciais do usuário e um rótulo acessível no avatar', async () => {
    const { element } = await setup('ADMIN');
    const account = element.querySelector('button[aria-label="Conta de Ana Paula Rodrigues"]');

    expect(account?.textContent?.trim()).toBe('AP');
  });
});
