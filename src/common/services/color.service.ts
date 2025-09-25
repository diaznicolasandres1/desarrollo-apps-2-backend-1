import { Injectable } from '@nestjs/common';

@Injectable()
export class ColorService {
  /**
   * Genera un color aleatorio de una paleta predefinida para mantener consistencia visual
   */
  static generateRandomColor(): string {
    // Array de colores predefinidos para mantener consistencia visual
    const colors = [
      '#FF6B6B', // Rojo coral
      '#4ECDC4', // Turquesa
      '#45B7D1', // Azul claro
      '#96CEB4', // Verde menta
      '#FECA57', // Amarillo dorado
      '#FF9FF3', // Rosa
      '#A8E6CF', // Verde claro
      '#FFD93D', // Amarillo brillante
      '#6C5CE7', // Morado
      '#FD79A8', // Rosa fuerte
      '#00B894', // Verde esmeralda
      '#FDCB6E', // Naranja suave
      '#E17055', // Rojo terracota
      '#74B9FF', // Azul cielo
      '#81ECEC', // Cian
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
