import { Injectable } from '@angular/core';
import { MatDateFormats, NativeDateAdapter } from '@angular/material/core';

/** El campo escrito y el calendario utilizan el mismo formato, sin Date.parse. */
@Injectable()
export class ReportDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) return this.isValid(value) ? value : this.invalid();
    if (typeof value !== 'string') return this.invalid();
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) return this.invalid();
    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? date : this.invalid();
  }

  override format(date: Date, displayFormat: object | string): string {
    if (displayFormat === 'dd/MM/yyyy') {
      const pad = (value: number) => String(value).padStart(2, '0');
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    }
    return super.format(date, displayFormat);
  }
}

export const REPORT_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: { year: 'numeric', month: 'long' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};
