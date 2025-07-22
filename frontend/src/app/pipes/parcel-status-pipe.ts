import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parcelStatus'
})
export class ParcelStatusPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case 'in_transit':
        return 'In Transit';
      case 'picked_up':
        return 'Picked Up';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'pending':
        return 'Pending';
      default:
        return value;
  }
  }
}
