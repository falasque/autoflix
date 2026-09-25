import { Vehicle } from './types';

// Dados mock para fallback quando XML não estiver disponível
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    slug: 'honda-civic-2020-1',
    name: 'Honda Civic EXL 2.0',
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    price: 89900,
    mileage: 35000,
    fuel: 'Flex',
    transmission: 'Automático',
    color: 'Branco',
    doors: 4,
    image: 'https://images.unsplash.com/photo-1549927681-0b673b922685?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1549927681-0b673b922685?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
    ],
    featured: true,
    description: 'Honda Civic EXL 2.0 em excelente estado de conservação. Revisões em dia, único dono.',
    specs: {
      engine: '2.0L',
      power: '155 cv'
    }
  },
  {
    id: '2',
    slug: 'toyota-corolla-2019-2',
    name: 'Toyota Corolla XEI 2.0',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2019,
    price: 76500,
    mileage: 42000,
    fuel: 'Flex',
    transmission: 'Automático',
    color: 'Prata',
    doors: 4,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
    ],
    featured: false,
    description: 'Toyota Corolla XEI 2.0 com baixa quilometragem. Carro muito bem conservado.',
    specs: {
      engine: '2.0L',
      power: '144 cv'
    }
  },
  {
    id: '3',
    slug: 'volkswagen-jetta-2018-3',
    name: 'Volkswagen Jetta TSI',
    brand: 'Volkswagen',
    model: 'Jetta',
    year: 2018,
    price: 68000,
    mileage: 38500,
    fuel: 'Gasolina',
    transmission: 'Automático',
    color: 'Preto',
    doors: 4,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ],
    featured: true,
    description: 'Volkswagen Jetta TSI com design elegante e desempenho excepcional.',
    specs: {
      engine: '1.4L Turbo',
      power: '150 cv'
    }
  },
  {
    id: '4',
    slug: 'hyundai-hb20-2021-4',
    name: 'Hyundai HB20 Evolution',
    brand: 'Hyundai',
    model: 'HB20',
    year: 2021,
    price: 52900,
    mileage: 18000,
    fuel: 'Flex',
    transmission: 'Manual',
    color: 'Vermelho',
    doors: 4,
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop'
    ],
    featured: false,
    description: 'Hyundai HB20 Evolution praticamente zero km, com garantia de fábrica.',
    specs: {
      engine: '1.0L',
      power: '80 cv'
    }
  },
  {
    id: '5',
    slug: 'ford-ka-2020-5',
    name: 'Ford Ka SE Plus',
    brand: 'Ford',
    model: 'Ka',
    year: 2020,
    price: 41500,
    mileage: 28000,
    fuel: 'Flex',
    transmission: 'Manual',
    color: 'Azul',
    doors: 4,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
    ],
    featured: false,
    description: 'Ford Ka SE Plus econômico e confiável, perfeito para o dia a dia.',
    specs: {
      engine: '1.5L',
      power: '120 cv'
    }
  },
  {
    id: '6',
    slug: 'chevrolet-onix-2019-6',
    name: 'Chevrolet Onix Premier',
    brand: 'Chevrolet',
    model: 'Onix',
    year: 2019,
    price: 48900,
    mileage: 32000,
    fuel: 'Flex',
    transmission: 'Automático',
    color: 'Cinza',
    doors: 4,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1607107881960-4031ad1b52a0?w=800&h=600&fit=crop'
    ],
    featured: true,
    description: 'Chevrolet Onix Premier com tecnologia avançada e conforto superior.',
    specs: {
      engine: '1.0L Turbo',
      power: '116 cv'
    }
  }
];