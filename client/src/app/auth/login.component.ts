import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'cl-login',
  imports: [CommonModule, FormsModule],
  templateUrl: `./login.component.html`,
  styleUrls: [`./login.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  username = 'admin';
  password = 'password';
  errorMessage = signal<string | null>(null);

  onLogin(): void {
    this.#authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.#router.navigate(['/events']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage.set('Invalid credentials');
      },
    });
  }
}
