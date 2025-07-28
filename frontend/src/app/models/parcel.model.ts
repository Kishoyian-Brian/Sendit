export interface Parcel {
  id: string;
  trackingNumber: string;
  sender: string;
  senderEmail: string;
  senderPhone: string;
  senderId?: string;
  pickupAddress: string;
  recipient: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientId?: string;
  deliveryAddress: string;
  pickupLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
  weight: string;
  description: string;
  driver: string;
  driverId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'assigned' | 'pending_pickup';
  createdAt: string;
  deliveredAt?: string;
  eta?: string;
  currentLocation?: { lat: number; lng: number };
  route?: { lat: number; lng: number; timestamp: string }[];
}
