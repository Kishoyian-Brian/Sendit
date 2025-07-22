import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (!value) return '';
    const date = new Date(value as string);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
