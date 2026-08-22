import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerBarrasComponent } from './scanner-barras.component';

describe('ScannerBarrasComponent', () => {
  let component: ScannerBarrasComponent;
  let fixture: ComponentFixture<ScannerBarrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerBarrasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerBarrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
