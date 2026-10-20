/** Corpo enviado para POST /auth/login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Resposta de POST /auth/login. */
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Claims que a Passage API coloca dentro do JWT.
 *
 * O campo `role` chega no formato do Spring Security (`ROLE_ADMIN`).
 */
export interface JwtClaims {
  sub: string;
  role: string;
  userId: string;
  companyUuid: string | null;
  exp: number;
}
