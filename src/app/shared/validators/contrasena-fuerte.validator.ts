import { AbstractControl } from '@angular/forms';

export function contrasenaFuerte(control: AbstractControl): { [key: string]: boolean } | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  if (v.length < 8) return { minLength8: true };
  if (!/[A-Z]/.test(v)) return { mayuscula: true };
  if (!/[a-z]/.test(v)) return { minuscula: true };
  if (!/[0-9]/.test(v)) return { numero: true };
  return null;
}
