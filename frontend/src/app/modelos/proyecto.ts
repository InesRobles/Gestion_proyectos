export type EstadoProyecto = 'en curso' | 'finalizado' | 'pausado';

export interface proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  cupoMaximo: number;
  estado: EstadoProyecto;
  fotoProyecto?: string | null;
}
