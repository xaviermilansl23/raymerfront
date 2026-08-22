import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverlaySpinnerComponent } from './core/overlay-spinner/overlay-spinner.component';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,


  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DePOSV1';
}
