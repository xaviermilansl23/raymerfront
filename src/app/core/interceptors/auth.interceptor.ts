import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');
    const skipToast = req.headers.get('X-Skip-Error-Interceptor') === 'true';

    // Limpia el header de control interno
    let headers = req.headers.delete('X-Skip-Error-Interceptor');

    // Asegura Accept JSON (no pisa Content-Type si ya viene seteado)
    if (!headers.has('Accept')) {
      headers = headers.set('Accept', 'application/json');
    }

    // Agrega Authorization si hay token
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const modifiedReq = req.clone({ headers });

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const method = req.method;
        const backendMessage = error?.error?.message || null;

        if (!skipToast) {
          if (error.status === 401) {
            // 🔧 Si quieres ver warning también en GET, descomenta la línea:
            // this.toastr.warning(backendMessage || 'No autorizado.', 'Atención');
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
              this.toastr.warning(backendMessage || 'No autorizado.', 'Atención');
            }
          } else if (error.status === 403) {
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
              this.toastr.warning('No tienes permiso para realizar esta acción.', 'Acceso denegado');
            }
          } else if (error.status === 404) {
            this.toastr.info(backendMessage || 'Recurso no encontrado.', '404');
          } else if (error.status >= 500) {
            this.toastr.error(backendMessage || 'Error interno del servidor.', 'Error');
          }
        }

        return throwError(() => error);
      })
    );
  }
}
