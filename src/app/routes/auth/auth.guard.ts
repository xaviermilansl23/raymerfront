import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRoles = this.authService.getRoles();
    const requiredRoles = route.data['roles'] as string[] | undefined;

    if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
      this.router.navigate(['/dashboard/home']);
      return false;
    }

    return true;
  }
}
