export interface Driver {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_delivery';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  deliveriesCompleted: number;
  vehicleInfo: {
    type: string;
    plateNumber: string;
    model: string;
  };
}

export interface DriverLoginCredentials {
  email: string;
  password: string;
}
