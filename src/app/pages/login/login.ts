import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

/** Conteúdo exibido no painel de marca, trocado automaticamente. */
interface Slide {
  icon: 'ticket' | 'bus' | 'route' | 'boarding';
  title: string;
  text: string;
}

/** Intervalo entre as trocas do painel, em milissegundos. */
const SLIDE_INTERVAL = 5000;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Requisição de login em andamento. */
  protected readonly loading = signal(false);

  /** Mensagem devolvida pela API quando o login falha. */
  protected readonly serverError = signal<string | null>(null);

  protected readonly slides: Slide[] = [
    {
      icon: 'ticket',
      title: 'Bilhetagem sem fila',
      text: 'Emita, consulte e cancele passagens em poucos segundos.'
    },
    {
      icon: 'bus',
      title: 'Frota sob controle',
      text: 'Ônibus, assentos e motoristas organizados em um só lugar.'
    },
    {
      icon: 'route',
      title: 'Rotas que fazem sentido',
      text: 'Linhas, horários e trajetos desenhados para a sua operação.'
    },
    {
      icon: 'boarding',
      title: 'Embarque tranquilo',
      text: 'Validação de bilhete na hora certa, direto no ponto de embarque.'
    }
  ];

  protected readonly current = signal(0);

  /** Ocupação ilustrativa do mapa de assentos (true = ocupado). */
  protected readonly seatMap: boolean[] = [
    true,  true,  false, false, true,  true,
    true,  false, false, false, true,  true,
    false, false, true,  true,  false, false,
    true,  true,  true,  false, false, true
  ];

  /** Progresso ilustrativo do embarque. */
  protected readonly boardingBars: boolean[] = [true, true, true, true, false, false];

  /** Alterna entre esconder e revelar a senha digitada. */
  protected readonly showPassword = signal(false);

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    // afterNextRender só executa no navegador, nunca na renderização
    // do servidor (SSR) — onde um timer ficaria rodando à toa.
    afterNextRender(() => this.startRotation());

    this.destroyRef.onDestroy(() => this.stopRotation());
  }

  protected startRotation(): void {
    this.stopRotation();
    this.timer = setInterval(() => this.next(), SLIDE_INTERVAL);
  }

  protected stopRotation(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  /** Troca manual pelos indicadores, reiniciando a contagem. */
  protected goTo(index: number): void {
    this.current.set(index);
    this.startRotation();
  }

  private next(): void {
    this.current.update(index => (index + 1) % this.slides.length);
  }

  protected togglePassword(): void {
    this.showPassword.update(visible => !visible);
  }

  /**
   * Indica se um campo deve exibir mensagem de erro.
   *
   * O erro só aparece depois que o usuário interage com o campo,
   * para o formulário não nascer todo vermelho.
   */
  protected hasError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorMessage(field: 'email' | 'password'): string {
    const control = this.form.controls[field];

    if (control.hasError('required')) {
      return field === 'email'
        ? 'Informe seu e-mail.'
        : 'Informe sua senha.';
    }

    if (control.hasError('email')) {
      return 'Esse e-mail não parece válido.';
    }

    if (control.hasError('minlength')) {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }

    return '';
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading.set(true);
    this.serverError.set(null);

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect ?? '/painel');
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.serverError.set(this.describe(error));
      }
    });
  }

  /** Traduz a falha HTTP em algo que o operador consiga agir. */
  private describe(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Não foi possível falar com o servidor. Verifique sua conexão.';
    }

    if (error.status === 401 || error.status === 409) {
      return 'E-mail ou senha incorretos.';
    }

    if (error.status >= 500) {
      return 'O servidor encontrou um problema. Tente novamente em instantes.';
    }

    return error.error?.detail ?? 'Não foi possível entrar. Tente novamente.';
  }
}
