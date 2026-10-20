/**
 * Papéis de acesso, espelhando o enum UserRole da Passage API.
 *
 * O Spring Security prefixa os papéis com `ROLE_` dentro do token,
 * mas aqui trabalhamos sempre com o nome puro.
 */
export type UserRole =
  | 'ADMIN'
  | 'FLEET_MANAGER'
  | 'TICKET_SELLER'
  | 'INSPECTOR'
  | 'CUSTOMER';

/** Descrição legível de cada papel, para exibição na interface. */
export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador Geral',
  FLEET_MANAGER: 'Gestor de Frota',
  TICKET_SELLER: 'Bilheteiro',
  INSPECTOR: 'Fiscal de Bordo',
  CUSTOMER: 'Passageiro'
};

/** Usuário autenticado, derivado do conteúdo do token JWT. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  companyUuid: string | null;
}
