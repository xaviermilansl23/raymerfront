import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScannerSyncService {
  private codigoSubject = new BehaviorSubject<string | null>(null);
  codigo$ = this.codigoSubject.asObservable();

  setCodigo(codigo: string) {
    this.codigoSubject.next(codigo);
  }

  reset() {
    this.codigoSubject.next(null);
  }
}
