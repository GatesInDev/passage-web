import { CnpjPipe, CpfPipe } from './document-pipes';
import { BrlPipe, DistancePipe, DurationPipe } from './measure-pipes';

/** O Intl separa "R$" do valor com um espaço não separável. */
const plain = (text: string) => text.replace(/ /g, ' ');

describe('pipes', () => {
  it('cpf e cnpj aplicam a pontuação', () => {
    expect(new CpfPipe().transform('12345678909')).toBe('123.456.789-09');
    expect(new CnpjPipe().transform('12345678000195')).toBe('12.345.678/0001-95');
    expect(new CnpjPipe().transform(null)).toBe('');
  });

  it('duration mostra horas e minutos como no protótipo', () => {
    const pipe = new DurationPipe();

    expect(pipe.transform(90)).toBe('1h30min');
    expect(pipe.transform(300)).toBe('5h00min');
    expect(pipe.transform(35)).toBe('35min');
    expect(pipe.transform(null)).toBe('');
  });

  it('brl formata em reais, aceitando número ou texto', () => {
    const pipe = new BrlPipe();

    expect(plain(pipe.transform(189.9))).toBe('R$ 189,90');
    expect(plain(pipe.transform('1500'))).toBe('R$ 1.500,00');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('distance usa vírgula e no máximo uma casa decimal', () => {
    const pipe = new DistancePipe();

    expect(pipe.transform(705.4)).toBe('705,4 km');
    expect(pipe.transform(546)).toBe('546 km');
    expect(pipe.transform(null)).toBe('');
  });
});
