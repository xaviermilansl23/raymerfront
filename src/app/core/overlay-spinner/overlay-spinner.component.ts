import { Component, ChangeDetectionStrategy} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overlay-spinner',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './overlay-spinner.component.html',
  styleUrl: './overlay-spinner.component.scss'
})
export class OverlaySpinnerComponent {

}
