import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonModal, IonBadge,
  IonItem, IonLabel, ToastController, IonList, IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, closeOutline, exitOutline, timeOutline,
  logInOutline, logOutOutline, addCircleOutline, chatbubblesOutline,
  chatbubbleEllipsesOutline, send, statsChartOutline,
  listOutline, checkmarkDoneCircle, eyeOutline,
  peopleOutline, folderOpenOutline, searchOutline,
  calendarOutline, saveOutline,
  checkboxOutline, checkmarkOutline, checkmarkCircleOutline,
  hourglassOutline, playCircleOutline,
  trashOutline, personOutline,
  documentOutline, imageOutline, logoGithub, createOutline, addOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { HeaderComponent } from '../components/header/header.component';
import { proyecto } from '../modelos/proyecto';
import { ProyectoService } from '../services/proyecto-service';
import { AlumnoService } from '../services/alumno-service';
import { AuthService } from '../services/auth-service';
import { UsuarioService, Usuario } from '../services/usuario-service';
import { AsignacionService } from '../services/asignacion-service';
import { ModalidadService } from '../services/modalidad-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {ComentarioDTO, ComentarioService} from "../services/comentario-service";
import {TareaDTO, TareaService} from "../services/tarea-service";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonModal, IonBadge, CommonModule,
    FormsModule, HeaderComponent,
    IonItem, IonLabel, IonInput, IonList
  ]
})
export class HomePage implements OnInit {

  isModalOpen = false;
  proyectoSeleccionado: any = null;
  esProyectoInscrito = false;
  nuevoComentario: string = '';
  enviandoComentario = false;

  // Chat
  comentarios: ComentarioDTO[] = [];
  loadingComentarios = false;

  // Tareas del proyecto (alumno)
  tareasProyecto: TareaDTO[] = [];
  loadingTareas = false;

  nombreUsuario = '';

  // Proyectos
  misProyectos: proyecto[] = [];
  misProyectosFiltrados: proyecto[] = [];
  loadingProyectos = true;

  // ─── NUEVOS CAMPOS EDICIÓN/CREACIÓN ───────────────────────────────────────
  modalCrearProyectoAbierto = false;
  guardandoProyecto = false;
  formProyecto = {
    titulo: '',
    descripcion: '',
    estado: 'en curso' as 'en curso' | 'finalizado' | 'pausado',
    fotoProyecto: null as string | null,
    videoUrl: '',
    enlaceGithub: '',
    memoria: '',
    privado: false
  };

  modoEdicion = false;
  formEdicionProyecto = {
    titulo: '',
    descripcion: '',
    estado: 'en curso' as 'en curso' | 'finalizado' | 'pausado',
    fotoProyecto: null as string | null,
    videoUrl: '',
    enlaceGithub: '',
    memoria: '',
    privado: false
  };

  documentosParaSubir: { nombre: string; contenido: string }[] = [];
  imagenesParaSubir: { nombre: string; contenido: string }[] = [];
  colaboradoresParaCrear: any[] = [];

  alumnosDisponibles: Usuario[] = [];
  subiendoRecurso = false;

  rolUsuario = '';
  todosLosAlumnos: Usuario[] = [];
  modalidades: { id: number; nombre: string }[] = [];
  proyectosParticipandoIds = new Set<number>();

  @ViewChild('inputImagenCrear') inputImagenCrearRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputImagenEdicion') inputImagenEdicionRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputDocumento') inputDocumentoRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputImagenGaleria') inputImagenGaleriaRef!: ElementRef<HTMLInputElement>;

  private toastController = inject(ToastController);
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);
  private alumnoService = inject(AlumnoService);
  private tareaService = inject(TareaService);
  private comentarioService = inject(ComentarioService);
  private usuarioService = inject(UsuarioService);
  private asignacionService = inject(AsignacionService);
  private modalidadService = inject(ModalidadService);
  private router = inject(Router);

  constructor() {
    addIcons({
      personCircle, closeOutline, exitOutline, timeOutline,
      logInOutline, logOutOutline, addCircleOutline, chatbubblesOutline,
      chatbubbleEllipsesOutline, send, statsChartOutline,
      listOutline, checkmarkDoneCircle, eyeOutline,
      peopleOutline, folderOpenOutline, searchOutline,
      calendarOutline, saveOutline,
      checkboxOutline, checkmarkOutline, checkmarkCircleOutline,
      hourglassOutline, playCircleOutline,
      trashOutline, personOutline,
      documentOutline, imageOutline, logoGithub, createOutline, addOutline,
      lockClosedOutline
    });
  }

  ngOnInit() {
    this.authService.sesion$.subscribe(sesion => {
      this.nombreUsuario = sesion?.nombreReal ?? 'Usuario';
    });
    const sesion = this.authService.obtenerSesion();
    if (sesion) {
      this.rolUsuario = sesion.rol;
      if (this.rolUsuario === 'administrador' || this.rolUsuario === 'admin') {
        this.router.navigate(['/home-admin']);
        return;
      }
    }
    this.cargarParticipando();
    this.cargarProyectos();
  }


  // PROYECTOS
  // ─────────────────────────────────────────────────────────────
  cargarParticipando() {
    const sesion = this.authService.obtenerSesion();
    if (sesion && sesion.rol !== 'admin') {
      this.proyectoService.getProyectosPorAlumno(sesion.id).subscribe({
        next: (proyectos) => {
          this.proyectosParticipandoIds = new Set(proyectos.map(p => p.id));
        }
      });
    } else {
      this.proyectosParticipandoIds.clear();
    }
  }

  esParticipante(proyectoId: number): boolean {
    return this.proyectosParticipandoIds.has(proyectoId);
  }

  cargarProyectos() {
    this.loadingProyectos = true;
    const sesion = this.authService.obtenerSesion();

    this.proyectoService.getProyectos(sesion?.id ?? undefined).subscribe({
      next: (proyectos) => {
        this.misProyectos = proyectos;
        this.misProyectosFiltrados = this.ordenarPorEstado(proyectos);
        this.loadingProyectos = false;
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Error al cargar los proyectos', duration: 2000,
          color: 'danger', position: 'top'
        });
        await toast.present();
        this.loadingProyectos = false;
      }
    });
  }

  buscarProyectos(textoBusqueda: string) {
    const texto = textoBusqueda ? textoBusqueda.toLowerCase().trim() : '';
    if (!texto) {
      this.misProyectosFiltrados = this.ordenarPorEstado(this.misProyectos);
      return;
    }
    this.misProyectosFiltrados = this.ordenarPorEstado(this.misProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) || p.descripcion?.toLowerCase().includes(texto)
    ));
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS DE PROYECTOS
  // ─────────────────────────────────────────────────────────────
  private ordenarPorEstado(proyectos: proyecto[]): proyecto[] {
    const prioridad: Record<string, number> = { 'en curso': 0, 'pausado': 1, 'finalizado': 2 };
    return [...proyectos].sort((a, b) => {
      const prioA = prioridad[a.estado] ?? 99;
      const prioB = prioridad[b.estado] ?? 99;
      if (prioA !== prioB) {
        return prioA - prioB;
      }
      return b.id - a.id;
    });
  }

  getClaseEstado(estado: string): string {
    return 'estado-' + (estado ?? '').replace(/ /g, '-');
  }

  getImagenProyecto(p: proyecto): string {
    return `https://picsum.photos/seed/${p.id}/600/400`;
  }

  getEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'en curso':   return 'En Curso';
      case 'finalizado': return 'Finalizado';
      case 'pausado':    return 'Pausado';
      default:           return estado;
    }
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'en curso':   return 'success';
      case 'finalizado': return 'medium';
      case 'pausado':    return 'warning';
      default:           return 'primary';
    }
  }



  // ─────────────────────────────────────────────────────────────
  // VER DETALLES / MODAL
  // ─────────────────────────────────────────────────────────────
  verDetalles(p: any, inscrito: boolean) {
    this.esProyectoInscrito = inscrito;
    this.isModalOpen = true;
    this.tareasProyecto = [];
    this.comentarios = [];
    this.nuevoComentario = '';
    this.modoEdicion = false;

    const sesion = this.authService.obtenerSesion();
    const usuarioId = sesion?.id ?? undefined;

    this.proyectoService.getProyectoById(p.id, usuarioId).subscribe({
      next: (fullProj) => {
        this.proyectoSeleccionado = { ...fullProj, alumnos: [] };
        // Cargar colaboradores
        this.proyectoService.getAlumnosPorProyecto(p.id).subscribe({
          next: (alumnosBackend: any[]) => {
            this.proyectoSeleccionado.alumnos = alumnosBackend;
          },
          error: (err) => {
            console.warn('[WARN] No se pudo cargar la lista de alumnos para este proyecto', err);
            this.proyectoSeleccionado.alumnos = [];
          }
        });
      },
      error: (err) => {
        console.error('Error fetching project by id, using fallback', err);
        this.proyectoSeleccionado = { ...p, alumnos: [] };
      }
    });

    this.cargarComentarios(p.id);

    if (inscrito) {
      const sesion = this.authService.obtenerSesion();
      if (sesion?.id) {
        this.loadingTareas = true;
        this.tareaService.getTareasConEstado(p.id, sesion.id).subscribe({
          next: (tareas) => {
            this.tareasProyecto = tareas;
            this.loadingTareas = false;
          },
          error: () => {
            this.tareasProyecto = [];
            this.loadingTareas = false;
          }
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHAT
  // ─────────────────────────────────────────────────────────────
  cargarComentarios(proyectoId: number) {
    this.loadingComentarios = true;
    this.comentarioService.getByProyecto(proyectoId).subscribe({
      next: (lista) => {
        this.comentarios = lista;
        this.loadingComentarios = false;
        this.scrollChatAbajo();
      },
      error: () => {
        this.comentarios = [];
        this.loadingComentarios = false;
      }
    });
  }

  agregarComentario() {
    const texto = this.nuevoComentario.trim();
    if (!texto || this.enviandoComentario) return;

    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id || !this.proyectoSeleccionado?.id) return;

    this.enviandoComentario = true;

    const temporal: ComentarioDTO = {
      id: -Date.now(),
      proyectoId: this.proyectoSeleccionado.id,
      usuarioId: sesion.id,
      nombreUsuario: sesion.nombreReal ?? 'Tú',
      fotoUsuario: sesion.fotoUsuario ?? undefined,
      texto,
      fecha: new Date().toISOString()
    };
    this.comentarios = [...this.comentarios, temporal];
    this.nuevoComentario = '';
    this.scrollChatAbajo();

    this.comentarioService.crear(this.proyectoSeleccionado.id, sesion.id, texto).subscribe({
      next: (real) => {
        this.comentarios = this.comentarios.map(c => c.id === temporal.id ? real : c);
        this.enviandoComentario = false;
      },
      error: () => {
        this.comentarios = this.comentarios.filter(c => c.id !== temporal.id);
        this.enviandoComentario = false;
        this.nuevoComentario = texto;
      }
    });
  }

  eliminarComentario(comentario: ComentarioDTO) {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    this.comentarios = this.comentarios.filter(c => c.id !== comentario.id);

    this.comentarioService.eliminar(comentario.id, sesion.id).subscribe({
      error: () => {
        this.comentarios = [...this.comentarios, comentario]
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      }
    });
  }

  esMiMensaje(comentario: ComentarioDTO): boolean {
    return this.authService.obtenerSesion()?.id === comentario.usuarioId;
  }

  formatearFecha(iso: string): string {
    const d = new Date(iso);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (esHoy) return hora;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' · ' + hora;
  }

  private scrollChatAbajo() {
    setTimeout(() => {
      const feed = document.querySelector('.comments-feed');
      if (feed) feed.scrollTop = feed.scrollHeight;
    }, 60);
  }

  // ─────────────────────────────────────────────────────────────
  // TAREAS
  // ─────────────────────────────────────────────────────────────
  toggleTarea(tarea: TareaDTO) {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id || !tarea.id) return;

    const nuevoEstado = !tarea.completada;
    tarea.completada = nuevoEstado;

    this.tareaService.toggleTarea(tarea.id, sesion.id, nuevoEstado).subscribe({
      error: () => {
        tarea.completada = !nuevoEstado;
      }
    });
  }

  tareasCompletadasCount(): number {
    return this.tareasProyecto.filter(t => t.completada).length;
  }

  tareasProgresoPct(): number {
    if (this.tareasProyecto.length === 0) return 0;
    return Math.round((this.tareasCompletadasCount() / this.tareasProyecto.length) * 100);
  }

  // ─── GESTIÓN DE PROYECTOS (PERMISOS, CREACIÓN, EDICIÓN Y RECURSOS) ───────

  puedeEditarProyecto(): boolean {
    if (!this.proyectoSeleccionado) return false;
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return false;

    if (sesion.rol === 'admin') return true;
    if (this.proyectoSeleccionado.creadorId === sesion.id) return true;

    if (this.proyectoSeleccionado.alumnos) {
      return this.proyectoSeleccionado.alumnos.some((alumno: any) => alumno.id === sesion.id);
    }
    return false;
  }

  puedeEditarDetallesProyecto(): boolean {
    if (!this.proyectoSeleccionado) return false;
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return false;

    // El admin global puede editar cualquier proyecto
    if (sesion.rol === 'admin') return true;

    // El creador del proyecto puede editar
    if (this.proyectoSeleccionado.creadorId === sesion.id) return true;

    // Si es colaborador y su rolProyecto es 'editor'
    if (this.proyectoSeleccionado.alumnos) {
      const miUsuario = this.proyectoSeleccionado.alumnos.find((alumno: any) => alumno.id === sesion.id);
      return miUsuario && miUsuario.rolProyecto === 'editor';
    }
    return false;
  }

  puedeEscribirChat(): boolean {
    if (!this.proyectoSeleccionado) return false;
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return false;

    // El admin global puede comentar
    if (sesion.rol === 'admin') return true;

    // El creador del proyecto siempre puede comentar
    if (this.proyectoSeleccionado.creadorId === sesion.id) return true;

    // Si es colaborador y su rolProyecto es 'editor'
    if (this.proyectoSeleccionado.alumnos) {
      const miUsuario = this.proyectoSeleccionado.alumnos.find((alumno: any) => alumno.id === sesion.id);
      return miUsuario && miUsuario.rolProyecto === 'editor';
    }
    return false;
  }

  esColaborador(): boolean {
    if (!this.proyectoSeleccionado) return false;
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return false;

    // El admin global tiene acceso total
    if (sesion.rol === 'admin') return true;

    if (this.proyectoSeleccionado.creadorId === sesion.id) return true;

    if (this.proyectoSeleccionado.alumnos) {
      return this.proyectoSeleccionado.alumnos.some((alumno: any) => alumno.id === sesion.id);
    }
    return false;
  }

  cambiarRolColaborador(colaborador: any, event: Event) {
    if (!this.proyectoSeleccionado) return;
    const select = event.target as HTMLSelectElement;
    const nuevoRol = select.value;
    this.asignacionService.cambiarRolColaborador(colaborador.id, this.proyectoSeleccionado.id, nuevoRol).subscribe({
      next: async () => {
        colaborador.rolProyecto = nuevoRol;
        await this.mostrarToast(`✅ Rol de ${colaborador.nombreReal} actualizado a ${nuevoRol}`, 'success');
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al cambiar el rol';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
        select.value = colaborador.rolProyecto;
      }
    });
  }

  puedeEliminarProyecto(): boolean {
    if (!this.proyectoSeleccionado) return false;
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return false;

    // El admin global o el creador del proyecto pueden borrarlo
    return sesion.rol === 'admin' || this.proyectoSeleccionado.creadorId === sesion.id;
  }

  abrirModalCrearProyecto() {
    this.formProyecto = {
      titulo: '',
      descripcion: '',
      estado: 'en curso',
      fotoProyecto: null,
      videoUrl: '',
      enlaceGithub: '',
      memoria: '',
      privado: false
    };
    this.documentosParaSubir = [];
    this.imagenesParaSubir = [];
    this.colaboradoresParaCrear = [];
    this.guardandoProyecto = false;
    this.modalCrearProyectoAbierto = true;
    this.cargarAlumnosDisponiblesParaCrear();
  }

  cerrarModalCrearProyecto() {
    this.modalCrearProyectoAbierto = false;
  }

  triggerInputImagenCrear() {
    this.inputImagenCrearRef?.nativeElement.click();
  }

  onImagenSeleccionadaCrear(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.mostrarToast('La imagen no puede superar los 2 MB', 'warning');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.formProyecto.fotoProyecto = reader.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  quitarImagenCrear(event: Event) {
    event.stopPropagation();
    this.formProyecto.fotoProyecto = null;
  }

  triggerInputDocumentoCrear(input: HTMLInputElement) {
    input.click();
  }

  onDocumentoSeleccionadoCrear(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarToast(`El documento ${file.name} supera los 5 MB`, 'warning');
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.documentosParaSubir.push({
          nombre: file.name,
          contenido: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  quitarDocumentoCrear(index: number) {
    this.documentosParaSubir.splice(index, 1);
  }

  triggerInputImagenGaleriaCrear(input: HTMLInputElement) {
    input.click();
  }

  onImagenGaleriaSeleccionadaCrear(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 2 * 1024 * 1024) {
        this.mostrarToast(`La imagen ${file.name} supera los 2 MB`, 'warning');
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenesParaSubir.push({
          nombre: file.name,
          contenido: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  quitarImagenGaleriaCrear(index: number) {
    this.imagenesParaSubir.splice(index, 1);
  }

  async guardarNuevoProyecto() {
    if (!this.formProyecto.titulo.trim()) return;
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    this.guardandoProyecto = true;
    const payload = {
      ...this.formProyecto,
      creadorId: sesion.id
    };

    this.proyectoService.crearProyecto(payload).subscribe({
      next: async (creado) => {
        const uploadObservables: any[] = [];

        // Documentos
        this.documentosParaSubir.forEach(doc => {
          uploadObservables.push(this.proyectoService.subirDocumento(creado.id, doc, sesion.id));
        });

        // Galería
        this.imagenesParaSubir.forEach(img => {
          uploadObservables.push(this.proyectoService.subirImagen(creado.id, img, sesion.id));
        });

        // Colaboradores
        this.colaboradoresParaCrear.forEach(colab => {
          if (colab.rolProyecto === 'editor') {
            uploadObservables.push(
              this.proyectoService.inscribirse(colab.id, creado.id).pipe(
                switchMap(() => this.asignacionService.cambiarRolColaborador(colab.id, creado.id, 'editor'))
              )
            );
          } else {
            uploadObservables.push(this.proyectoService.inscribirse(colab.id, creado.id));
          }
        });

        if (uploadObservables.length > 0) {
          forkJoin(uploadObservables).subscribe({
            next: async () => {
              this.guardandoProyecto = false;
              await this.mostrarToast('✅ Proyecto creado y recursos asignados con éxito', 'success');
              this.cargarParticipando();
              this.cargarProyectos();
              this.cerrarModalCrearProyecto();
            },
            error: async () => {
              this.guardandoProyecto = false;
              await this.mostrarToast('✅ Proyecto creado, pero hubo un error al subir algunos recursos o colaboradores', 'warning');
              this.cargarParticipando();
              this.cargarProyectos();
              this.cerrarModalCrearProyecto();
            }
          });
        } else {
          this.guardandoProyecto = false;
          await this.mostrarToast('✅ Proyecto creado con éxito', 'success');
          this.cargarParticipando();
          this.cargarProyectos();
          this.cerrarModalCrearProyecto();
        }
      },
      error: async (err) => {
        this.guardandoProyecto = false;
        const msg = err?.error?.message ?? 'Error al crear el proyecto';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  activarModoEdicion() {
    if (!this.proyectoSeleccionado) return;
    this.formEdicionProyecto = {
      titulo: this.proyectoSeleccionado.titulo,
      descripcion: this.proyectoSeleccionado.descripcion || '',
      estado: this.proyectoSeleccionado.estado,
      fotoProyecto: this.proyectoSeleccionado.fotoProyecto || null,
      videoUrl: this.proyectoSeleccionado.videoUrl || '',
      enlaceGithub: this.proyectoSeleccionado.enlaceGithub || '',
      memoria: this.proyectoSeleccionado.memoria || '',
      privado: this.proyectoSeleccionado.privado || false
    };
    this.modoEdicion = true;
    this.cargarAlumnosDisponibles();
  }

  cancelarEdicion() {
    this.modoEdicion = false;
  }

  async guardarEdicionProyecto() {
    if (!this.proyectoSeleccionado || !this.formEdicionProyecto.titulo.trim()) return;
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    this.proyectoService.actualizarProyecto(this.proyectoSeleccionado.id, this.formEdicionProyecto, sesion.id).subscribe({
      next: async (actualizado) => {
        this.proyectoSeleccionado = { ...this.proyectoSeleccionado, ...actualizado };
        this.modoEdicion = false;
        await this.mostrarToast('✅ Proyecto actualizado con éxito', 'success');
        this.cargarProyectos();
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al actualizar el proyecto';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  async eliminarProyectoPropio() {
    if (!this.proyectoSeleccionado) return;
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto de forma permanente?')) {
      return;
    }

    this.proyectoService.eliminarProyecto(this.proyectoSeleccionado.id, sesion.id).subscribe({
      next: async () => {
        await this.mostrarToast('🗑️ Proyecto eliminado con éxito', 'success');
        this.isModalOpen = false;
        this.cargarProyectos();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar el proyecto';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  // ─── RECURSOS DE PROYECTO (DOCUMENTOS E IMÁGENES) ────────────────────────

  triggerInputDocumento() {
    this.inputDocumentoRef?.nativeElement.click();
  }

  onDocumentoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.proyectoSeleccionado) return;

    if (file.size > 5 * 1024 * 1024) {
      this.mostrarToast('El documento no puede superar los 5 MB', 'warning');
      input.value = '';
      return;
    }

    this.subiendoRecurso = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const sesion = this.authService.obtenerSesion();
      this.proyectoService.subirDocumento(this.proyectoSeleccionado.id, { nombre: file.name, contenido: base64 }, sesion?.id ?? undefined).subscribe({
        next: async (actualizado) => {
          this.subiendoRecurso = false;
          await this.mostrarToast('✅ Documento subido correctamente', 'success');
          this.recargarDetallesProyecto();
        },
        error: async (err) => {
          this.subiendoRecurso = false;
          const msg = err?.error?.message ?? 'Error al subir el documento';
          await this.mostrarToast(`❌ ${msg}`, 'danger');
        }
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  eliminarDocumento(docId: number) {
    if (!this.proyectoSeleccionado) return;
    const sesion = this.authService.obtenerSesion();
    this.proyectoService.eliminarDocumento(this.proyectoSeleccionado.id, docId, sesion?.id ?? undefined).subscribe({
      next: async () => {
        await this.mostrarToast('🗑️ Documento eliminado', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar el documento';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  triggerInputImagenGaleria() {
    this.inputImagenGaleriaRef?.nativeElement.click();
  }

  onImagenGaleriaSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.proyectoSeleccionado) return;

    if (file.size > 2 * 1024 * 1024) {
      this.mostrarToast('La imagen no puede superar los 2 MB', 'warning');
      input.value = '';
      return;
    }

    this.subiendoRecurso = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const sesion = this.authService.obtenerSesion();
      this.proyectoService.subirImagen(this.proyectoSeleccionado.id, { nombre: file.name, contenido: base64 }, sesion?.id ?? undefined).subscribe({
        next: async (actualizado) => {
          this.subiendoRecurso = false;
          await this.mostrarToast('✅ Imagen añadida a la galería', 'success');
          this.recargarDetallesProyecto();
        },
        error: async (err) => {
          this.subiendoRecurso = false;
          const msg = err?.error?.message ?? 'Error al subir la imagen';
          await this.mostrarToast(`❌ ${msg}`, 'danger');
        }
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  eliminarImagenGaleria(imgId: number) {
    if (!this.proyectoSeleccionado) return;
    const sesion = this.authService.obtenerSesion();
    this.proyectoService.eliminarImagen(this.proyectoSeleccionado.id, imgId, sesion?.id ?? undefined).subscribe({
      next: async () => {
        await this.mostrarToast('🗑️ Imagen eliminada de la galería', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar la imagen';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  // ─── COLABORADORES ────────────────────────────────────────────────────────

  cargarAlumnosDisponibles() {
    if (!this.proyectoSeleccionado) return;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        const alumnos = usuarios.filter(u => u.rol === 'alumno');
        const actualesIds = new Set(this.proyectoSeleccionado.alumnos?.map((a: any) => a.id) || []);
        this.alumnosDisponibles = alumnos.filter(alumno => !actualesIds.has(alumno.id));
      }
    });
  }

  cargarAlumnosDisponiblesParaCrear() {
    const sesion = this.authService.obtenerSesion();
    const creadorId = sesion?.id;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        const alumnos = usuarios.filter(u => u.rol === 'alumno');
        const actualesIds = new Set(this.colaboradoresParaCrear.map(a => a.id));
        if (creadorId) {
          actualesIds.add(creadorId);
        }
        this.alumnosDisponibles = alumnos.filter(alumno => !actualesIds.has(alumno.id));
      }
    });
  }

  agregarColaboradorCrear(event: Event) {
    const select = event.target as HTMLSelectElement;
    const colabUsuarioId = Number(select.value);
    if (!colabUsuarioId) return;

    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        const alumno = usuarios.find(u => u.id === colabUsuarioId);
        if (alumno) {
          this.colaboradoresParaCrear.push({
            ...alumno,
            rolProyecto: 'lector'
          });
          this.cargarAlumnosDisponiblesParaCrear();
        }
      }
    });
    select.value = '';
  }

  cambiarRolColaboradorCrear(alumno: any, event: Event) {
    const select = event.target as HTMLSelectElement;
    alumno.rolProyecto = select.value;
  }

  eliminarColaboradorCrear(colabUsuarioId: number) {
    this.colaboradoresParaCrear = this.colaboradoresParaCrear.filter(c => c.id !== colabUsuarioId);
    this.cargarAlumnosDisponiblesParaCrear();
  }

  triggerInputImagenEdicion() {
    this.inputImagenEdicionRef?.nativeElement.click();
  }

  onImagenSeleccionadaEdicion(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.mostrarToast('La imagen no puede superar los 2 MB', 'warning');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.formEdicionProyecto.fotoProyecto = reader.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  quitarImagenEdicion(event: Event) {
    event.stopPropagation();
    this.formEdicionProyecto.fotoProyecto = null;
  }

  agregarColaborador(event: Event) {
    const select = event.target as HTMLSelectElement;
    const colabUsuarioId = Number(select.value);
    if (!colabUsuarioId || !this.proyectoSeleccionado) return;

    this.proyectoService.inscribirse(colabUsuarioId, this.proyectoSeleccionado.id).subscribe({
      next: async () => {
        await this.mostrarToast('✅ Colaborador añadido al proyecto', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al añadir colaborador';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
    select.value = '';
  }

  eliminarColaborador(colabUsuarioId: number) {
    if (!this.proyectoSeleccionado) return;
    this.proyectoService.salir(colabUsuarioId, this.proyectoSeleccionado.id).subscribe({
      next: async () => {
        await this.mostrarToast('🗑️ Colaborador eliminado del proyecto', 'success');
        this.recargarDetallesProyecto();
        const sesion = this.authService.obtenerSesion();
        if (sesion && colabUsuarioId === sesion.id) {
          this.cargarParticipando();
        }
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar colaborador';
        await this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  recargarDetallesProyecto() {
    if (!this.proyectoSeleccionado) return;
    const sesion = this.authService.obtenerSesion();
    const usuarioId = sesion?.id ?? undefined;
    this.proyectoService.getProyectoById(this.proyectoSeleccionado.id, usuarioId).subscribe({
      next: (fullProj) => {
        this.proyectoSeleccionado = { ...this.proyectoSeleccionado, ...fullProj };
        this.proyectoService.getAlumnosPorProyecto(fullProj.id).subscribe({
          next: (alumnosBackend: any[]) => {
            this.proyectoSeleccionado.alumnos = alumnosBackend;
            this.cargarAlumnosDisponibles();
          }
        });
      }
    });
  }

  // ─── TOAST AUXILIAR ────────────────────────────────────────────────────────

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }

  cargarModalidades() {
    this.modalidadService.getModalidades().subscribe({
      next: (modalidades) => {
        this.modalidades = modalidades;
      }
    });
  }

  cargarTodosLosAlumnos() {
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.todosLosAlumnos = usuarios.filter(u => u.rol === 'alumno');
      },
      error: (err) => {
        console.error('[ERROR] No se pudieron cargar los alumnos', err);
      }
    });
  }

  guardarAlumnoAdmin(alumno: Usuario) {
    if (!alumno.nombreReal || !alumno.nombreUsuario) {
      this.mostrarToast('Por favor completa todos los campos del alumno', 'warning');
      return;
    }
    this.usuarioService.actualizarUsuario(alumno.id, {
      nombreReal: alumno.nombreReal,
      nombreUsuario: alumno.nombreUsuario,
      rol: alumno.rol
    }).subscribe({
      next: () => {
        if (alumno.modalidadId) {
          this.usuarioService.actualizarModalidad(alumno.id, alumno.modalidadId).subscribe({
            next: () => {
              this.mostrarToast('✅ Alumno y modalidad guardados con éxito', 'success');
              this.cargarTodosLosAlumnos();
            },
            error: () => {
              this.mostrarToast('⚠️ Alumno guardado, pero falló la modalidad', 'warning');
            }
          });
        } else {
          this.mostrarToast('✅ Alumno guardado con éxito', 'success');
          this.cargarTodosLosAlumnos();
        }
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al actualizar alumno';
        this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  eliminarAlumnoAdmin(alumnoId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este alumno? Se eliminarán también sus proyectos asociados.')) {
      this.usuarioService.eliminarUsuario(alumnoId).subscribe({
        next: () => {
          this.mostrarToast('🗑️ Alumno eliminado correctamente', 'success');
          this.cargarTodosLosAlumnos();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Error al eliminar alumno';
          this.mostrarToast(`❌ ${msg}`, 'danger');
        }
      });
    }
  }

  eliminarProyectoDesdeFila(p: proyecto) {
    if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${p.titulo}"?`)) {
      const sesion = this.authService.obtenerSesion();
      this.proyectoService.eliminarProyecto(p.id, sesion?.id ?? undefined).subscribe({
        next: () => {
          this.mostrarToast('🗑️ Proyecto eliminado correctamente', 'success');
          this.cargarProyectos();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Error al eliminar el proyecto';
          this.mostrarToast(`❌ ${msg}`, 'danger');
        }
      });
    }
  }
}
