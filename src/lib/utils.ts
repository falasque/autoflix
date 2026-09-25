import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Embaralha (Fisher-Yates) uma cópia do array e retorna
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Gera descrição padrão para um veículo
 */
export function getVehicleStandardDescription(brand: string, model: string): string {
  return `${brand} ${model} em excelente estado. Veículo completo, revisado e com garantia. Entre em contato para mais informações e agende um test drive!`;
}
