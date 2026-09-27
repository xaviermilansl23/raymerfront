import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    // Usuario ya autenticado: no debe ver el login
    if (token && !this.authService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}