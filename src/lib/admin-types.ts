export interface SiteConfig {
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  xmlUrl?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    whatsapp?: string;
  };
  secondaryStore?: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
  };
  features: string[];
  socialMedia: {
    instagram?: string;
    whatsapp?: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    enabled: boolean;
  };
}

export interface AdminAuth {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  description: string;
  features: string[];
  category: 'car' | 'motorcycle' | 'truck' | 'suv';
  status: 'available' | 'sold' | 'reserved';
}