import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarRolComponent } from './asignar-rol.component';

describe('AsignarRolComponent', () => {
  let component: AsignarRolComponent;
  let fixture: ComponentFixture<AsignarRolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarRolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
