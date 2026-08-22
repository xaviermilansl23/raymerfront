import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGastoDialogComponent } from './crear-gasto-dialog.component';

describe('CrearGastoDialogComponent', () => {
  let component: CrearGastoDialogComponent;
  let fixture: ComponentFixture<CrearGastoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGastoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearGastoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
