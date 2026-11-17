import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';

/**
 * Corpo de erro da Passage API (RFC 7807), montado pelo
 * `GlobalExceptionHandler` do backend.
 */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  /** Mensagem em português, pronta para o usuário. */
  detail?: string;
  /** Só nos erros de validação (400): itens no formato `"campo: mensagem"`. */
  invalidFields?: string[];
  timestamp?: string;
}

const FALLBACK = 'Não foi possível concluir a operação. Tente novamente.';

function problemOf(error: unknown): ProblemDetail | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  const body: unknown = error.error;
  return typeof body === 'object' && body !== null ? (body as ProblemDetail) : null;
}

/**
 * Traduz uma falha HTTP em uma frase para o usuário.
 *
 * O que a API devolve hoje, e que esta função leva em conta:
 *   400  validação dos dados; os campos vêm em `invalidFields`
 *   403  sem permissão — e também requisição sem token
 *   404  usuário não encontrado
 *   409  regra de negócio (código, CNPJ ou e-mail duplicado) e também
 *        empresa, rota ou passagem não encontrada
 *
 * Em 404 e 409 o `detail` já explica o que houve, então é repassado.
 */
export function apiErrorMessage(error: unknown, fallback = FALLBACK): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'Não foi possível falar com o servidor. Verifique sua conexão.';
  }

  if (error.status === 401) {
    return 'Sua sessão expirou. Entre novamente.';
  }

  if (error.status === 403) {
    return 'Você não tem permissão para executar esta ação.';
  }

  if (error.status >= 500) {
    return 'O servidor encontrou um problema. Tente novamente em instantes.';
  }

  return problemOf(error)?.detail ?? fallback;
}

/**
 * Erros de validação por campo, a partir de `invalidFields`.
 *
 * `["code: O código da rota é obrigatório."]` → `{ code: 'O código da rota é obrigatório.' }`
 */
export function apiFieldErrors(error: unknown): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const entry of problemOf(error)?.invalidFields ?? []) {
    const separator = entry.indexOf(':');

    if (separator > 0) {
      const field = entry.slice(0, separator).trim();
      // Um campo pode falhar em mais de uma regra; fica a primeira.
      fields[field] ??= entry.slice(separator + 1).trim();
    }
  }

  return fields;
}

/**
 * Marca nos campos do formulário os erros de validação devolvidos pela API.
 *
 * Os nomes dos controles precisam ser os mesmos dos campos do DTO
 * (`corporateName`, `documentId`...). A mensagem aparece sob o campo e
 * some sozinha quando o usuário altera o valor.
 *
 * Devolve `true` quando ao menos um campo foi marcado — nesse caso não é
 * preciso mostrar também a mensagem geral.
 *
 * Uso:
 *   error: (error: HttpErrorResponse) => {
 *     if (!applyApiFieldErrors(this.form, error)) {
 *       this.toast.error(apiErrorMessage(error));
 *     }
 *   }
 */
export function applyApiFieldErrors(form: AbstractControl, error: unknown): boolean {
  let applied = false;

  for (const [field, message] of Object.entries(apiFieldErrors(error))) {
    const control = form.get(field);

    if (control !== null) {
      control.setErrors({ ...control.errors, server: message });
      control.markAsTouched();
      applied = true;
    }
  }

  return applied;
}
