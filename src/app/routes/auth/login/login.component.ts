import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule
  ],
})
export class LoginComponent {
  usuario: string = '';
  contrasena: string = '';
  errorMessage: string | null = null;
  enviando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.enviando) return;

    if (!this.usuario?.trim() || !this.contrasena) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    // ✅ Backend espera 'contrasena' (sin ñ)
    const credentials = {
      usuario: this.usuario.trim(),
      contrasena: this.contrasena
    };

    this.enviando = true;
    this.errorMessage = null;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.enviando = false;
        if (response && response.token) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Respuesta inesperada del servidor.';
        }
      },
      error: (err) => {
        this.enviando = false;
        this.errorMessage =
          err?.error?.message || 'Credenciales incorrectas. Inténtalo de nuevo.';
      },
    });
  }
}
