import { UserRole } from '../../core/models/user.model';

const EVERYONE: readonly UserRole[] = [
  'ADMIN',
  'FLEET_MANAGER',
  'TICKET_SELLER',
  'INSPECTOR',
  'CUSTOMER'
];

/**
 * Quem pode o quê, copiado dos `@PreAuthorize` dos controllers da
 * Passage API. Use com `*appHasRole`, com o `roleGuard` das rotas e no
 * `roles` dos itens do `app-topbar`.
 *
 * Se a regra mudar no backend, é aqui que ela muda no frontend.
 *
 * O que estas listas não cobrem, porque depende do dado e não só do
 * perfil — a API responde 403 nesses casos:
 *   - o FLEET_MANAGER só altera a própria empresa;
 *   - o FLEET_MANAGER só altera e remove rotas da própria empresa, e
 *     sempre cadastra rotas nela (o ADMIN informa `companyUuid`).
 */
export const PERMISSIONS = {
  /** `/users` — todo o cadastro de usuários. */
  userManage: ['ADMIN'],

  /** `POST /companies` */
  companyCreate: ['ADMIN'],
  /** `GET /companies/{id}` */
  companyView: ['ADMIN', 'FLEET_MANAGER'],
  /** `PATCH /companies/{id}` */
  companyUpdate: ['ADMIN', 'FLEET_MANAGER'],

  /** `GET /routes` e `GET /routes/{id}` — qualquer usuário autenticado. */
  routeView: EVERYONE,
  /** `POST`, `PUT` e `DELETE /routes` */
  routeManage: ['ADMIN', 'FLEET_MANAGER'],

  /** `GET /tickets` */
  ticketList: ['ADMIN', 'TICKET_SELLER'],
  /** `GET /tickets/{id}` — o fiscal consulta para validar o embarque. */
  ticketView: ['ADMIN', 'TICKET_SELLER', 'INSPECTOR'],
  /** `POST /tickets` e `PUT /tickets/{id}` */
  ticketSell: ['ADMIN', 'TICKET_SELLER'],
  /** `DELETE /tickets/{id}` */
  ticketCancel: ['ADMIN']
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;
