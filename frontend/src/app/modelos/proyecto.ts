export type EstadoProyecto = 'en curso' | 'finalizado' | 'pausado';

export interface ProyectoDocumento {
  id?: number;
  nombre: string;
  contenido: string; // Base64 encoded file content
}

export interface ProyectoImagen {
  id?: number;
  nombre: string;
  contenido: string; // Base64 encoded image content
}

export interface proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  estado: EstadoProyecto;
  fotoProyecto?: string | null;
  videoUrl?: string;
  creadorId?: number | null;
  enlaceGithub?: string | null;
  memoria?: string | null;
  documentos?: ProyectoDocumento[];
  imagenes?: ProyectoImagen[];
  privado?: boolean;
}
