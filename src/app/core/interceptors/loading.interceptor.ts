import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingOverlayService } from '../services/loading-overlay.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  // cuántas peticiones hay en curso
  private activeRequests = 0;

  // header opcional para saltar el loader en una petición concreta
  private readonly SKIP_HEADER = 'X-Skip-Loading-Interceptor';

  constructor(private loader: LoadingOverlayService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const skip = req.headers.get(this.SKIP_HEADER) === 'true';

    // Limpia el header antes de enviar
    const cleanReq = req.clone({ headers: req.headers.delete(this.SKIP_HEADER) });

    // Solo cuenta verbos que nos interesan
    const method = cleanReq.method.toUpperCase();
    const track =
      !skip && ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (track) {
      this.activeRequests++;
      if (this.activeRequests === 1) {
        this.loader.show();
      }
    }

    return next.handle(cleanReq).pipe(
      finalize(() => {
        if (track) {
          this.activeRequests = Math.max(0, this.activeRequests - 1);
          if (this.activeRequests === 0) {
            this.loader.hide();
          }
        }
      })
    );
  }
}
