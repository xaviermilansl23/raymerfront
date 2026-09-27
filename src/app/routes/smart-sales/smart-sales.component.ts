import { Component } from '@angular/core';

@Component({
  selector: 'app-smart-sales',
  standalone: true,
  template: `
    <section class="smart-sales-page" aria-labelledby="smart-sales-title">
      <h1 id="smart-sales-title">Smart Sales</h1>
      <div class="smart-sales-canvas"></div>
    </section>
  `,
  styles: [`
    .smart-sales-page { display: flex; flex-direction: column; gap: 20px; min-height: calc(100dvh - 128px); }
    h1 { margin: 0; color: var(--rm-ink); font-size: 24px; font-weight: 600; }
    .smart-sales-canvas { flex: 1; min-height: 320px; background: var(--rm-surface); border: 1px solid var(--rm-border); border-radius: var(--rm-radius); }
  `],
})
export class SmartSalesComponent {}
