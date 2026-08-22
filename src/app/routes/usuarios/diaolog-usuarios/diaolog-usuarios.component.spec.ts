import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaologUsuariosComponent } from './diaolog-usuarios.component';

describe('DiaologUsuariosComponent', () => {
  let component: DiaologUsuariosComponent;
  let fixture: ComponentFixture<DiaologUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaologUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiaologUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
