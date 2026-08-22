import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarEliminarDialogComponent } from './confirmar-eliminar-dialog.component';

describe('ConfirmarEliminarDialogComponent', () => {
  let component: ConfirmarEliminarDialogComponent;
  let fixture: ComponentFixture<ConfirmarEliminarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarEliminarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarEliminarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
