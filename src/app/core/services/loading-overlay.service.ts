import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { OverlaySpinnerComponent } from '../overlay-spinner/overlay-spinner.component';

@Injectable({ providedIn: 'root' })
export class LoadingOverlayService {
  private overlayRef?: OverlayRef;
  private showTimer?: any;
  private visible = false;

  // ajuste anti-parpadeo
  private readonly showDelayMs = 350;

  constructor(private overlay: Overlay) {}

  private createOverlay(): OverlayRef {
    const positionStrategy = this.overlay.position()
      .global()
       .bottom('20px') // 👈 Abajo
    .left('20px');  // 👈 Izquierda

    return this.overlay.create({
      hasBackdrop: false,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'fm-loading-overlay-panel'
    });
  }

  show() {
    if (this.visible) return;
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => {
      if (!this.overlayRef) this.overlayRef = this.createOverlay();
      if (!this.overlayRef.hasAttached()) {
        this.overlayRef.attach(new ComponentPortal(OverlaySpinnerComponent));
      }
      this.visible = true;
    }, this.showDelayMs);
  }

 hide() {
  clearTimeout(this.showTimer);

  if (this.overlayRef?.hasAttached()) {
    const hostElement = this.overlayRef.overlayElement.querySelector('app-overlay-spinner');
    if (hostElement) {
      hostElement.classList.add('fade-out'); // 👈 Activamos animación
    }

    setTimeout(() => {
      this.overlayRef?.detach();
      this.visible = false;
    }, 250); // igual a la duración de la animación en ms
  } else {
    this.visible = false;
  }
}

}
