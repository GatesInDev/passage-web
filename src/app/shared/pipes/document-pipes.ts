import { Pipe, PipeTransform } from '@angular/core';

import { formatCnpj, formatCpf } from '../forms/masks';

/**
 * CPF com pontuação. A API devolve só os dígitos.
 *
 * `{{ ticket.passengerDocument | cpf }}` → 123.456.789-09
 */
@Pipe({ name: 'cpf' })
export class CpfPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatCpf(value);
  }
}

/**
 * CNPJ com pontuação. A API devolve os 14 caracteres sem máscara.
 *
 * `{{ company.documentId | cnpj }}` → 12.345.678/0001-95
 */
@Pipe({ name: 'cnpj' })
export class CnpjPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatCnpj(value);
  }
}
