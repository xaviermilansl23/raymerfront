import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProductoComponent } from './dialog-producto.component';

describe('DialogProductoComponent', () => {
  let component: DialogProductoComponent;
  let fixture: ComponentFixture<DialogProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
