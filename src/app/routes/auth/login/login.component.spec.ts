import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError, of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no envía credenciales vacías y muestra error', () => {
    component.usuario = '  ';
    component.contrasena = '';

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('completa todos los campos');
  });

  it('envía credenciales sin espacios y navega a dashboard al loguear', () => {
    authService.login.and.returnValue(
      of({ token: 'abc123', usuario: { nombre: 'Test' } })
    );

    component.usuario = '  admin  ';
    component.contrasena = 'secreto';

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      usuario: 'admin',
      contrasena: 'secreto',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('muestra error cuando las credenciales son inválidas', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Credenciales incorrectas' } }))
    );

    component.usuario = 'admin';
    component.contrasena = 'mal';

    component.onSubmit();

    expect(component.errorMessage).toContain('Credenciales incorrectas');
    expect(component.enviando).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});