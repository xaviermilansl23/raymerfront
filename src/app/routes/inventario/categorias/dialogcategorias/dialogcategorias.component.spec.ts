import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogcategoriasComponent } from './dialogcategorias.component';

describe('DialogcategoriasComponent', () => {
  let component: DialogcategoriasComponent;
  let fixture: ComponentFixture<DialogcategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogcategoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogcategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
