
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  status: 'open' | 'closed' | 'busy';
  average_prep_time: number;
  banner_image_url?: string;
  logo_url?: string;
  cuisine_type: string;
  rating?: number;
  total_ratings: number;
  minimum_order: number;
  delivery_fee: number;
  business_hours: BusinessHours;
  special_days?: string[];
}

export interface BusinessHours {
  regular: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  special?: {
    date: string;
    hours: {
      open: string;
      close: string;
    };
  }[];
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  table_id: string;
  customer_id: string;
  reservation_date: Date;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
}
