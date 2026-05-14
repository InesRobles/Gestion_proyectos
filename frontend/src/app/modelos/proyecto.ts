export type EstadoProyecto = 'en curso' | 'finalizado' | 'pausado';

export interface proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  cupoMaximo: number;
  cuposDisponibles: number;
  estado: EstadoProyecto;
}
