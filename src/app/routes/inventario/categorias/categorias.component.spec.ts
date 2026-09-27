import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasComponent } from './categorias.component';
import { FreshService } from '../../services/fresh.service';
import { freshServiceStub } from '../../services/test-stubs';

describe('CategoriasComponent', () => {
  let component: CategoriasComponent;
  let fixture: ComponentFixture<CategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasComponent],
      providers: [{ provide: FreshService, useValue: freshServiceStub() }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});