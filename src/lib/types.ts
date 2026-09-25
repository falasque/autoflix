export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'Gasolina' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido';
  transmission: 'Manual' | 'Automático' | 'CVT';
  color: string;
  doors: number;
  image: string;
  images?: string[];
  featured?: boolean;
  description?: string;
  specs?: {
    engine?: string;
    power?: string;
    torque?: string;
    acceleration?: string;
    maxSpeed?: string;
    consumption?: string;
  };
  features?: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  active: boolean;
}

export interface StoreConfig {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapUrl: string;
  openingHours: string;
  instagram?: string;
  facebook?: string;
}
