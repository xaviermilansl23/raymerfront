import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogUsuarioComponent } from './confirm-dialog-usuario.component';

describe('ConfirmDialogUsuarioComponent', () => {
  let component: ConfirmDialogUsuarioComponent;
  let fixture: ComponentFixture<ConfirmDialogUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
