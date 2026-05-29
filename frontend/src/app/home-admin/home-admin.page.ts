import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonProgressBar, ToastController,
  IonSearchbar, IonCardSubtitle, IonInput, IonSelect, IonSelectOption,
  IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, businessOutline, personAddOutline,
  settingsOutline, searchOutline, schoolOutline,
  statsChartOutline, listOutline, pencilOutline, trashOutline,
  personOutline, shieldCheckmarkOutline, readerOutline,
  closeOutline, checkmarkOutline, hourglassOutline,
  peopleCircleOutline, checkboxOutline, squareOutline,
  addOutline, createOutline, addCircleOutline, folderOpenOutline,
  playCircleOutline, pauseCircleOutline, checkmarkCircleOutline,
  imageOutline, timeOutline, logInOutline, logOutOutline, calendarOutline, saveOutline,
  checkmarkDoneCircle,
  reorderThreeOutline, informationCircleOutline,
  // ── AFK ──────────────────────────────────────────────────────
  closeCircleOutline, checkmarkDoneCircleOutline,
  chevronUpOutline, chevronDownOutline
} from 'ionicons/icons';
import { alumno } from '../modelos/alumno';
import { AlumnoService } from '../services/alumno-service';
import { UsuarioService, Usuario } from '../services/usuario-service';
import { ProyectoService } from '../services/proyecto-service';
import { AsistenciaService, AsistenciaDTO } from '../services/asistencia-service';
import { AuthService } from '../services/auth-service';
import { proyecto, EstadoProyecto } from '../modelos/proyecto';
import { HeaderComponent } from '../components/header/header.component';
import { forkJoin } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RegistroActividad, RegistroActividadService } from "../services/registro-actividad-service";
import { TareaService } from "../services/tarea-service";
import { ModalidadService } from '../services/modalidad-service';
// ── AFK ────────────────────────────────────────────────────────

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.page.html',
  styleUrls: ['./home-admin.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, CommonModule,
    FormsModule, IonProgressBar, IonSearchbar, IonCardSubtitle, HeaderComponent,
    IonInput, IonSelect, IonSelectOption, IonItem, IonLabel,
  ]
})
export class HomeAdminPage implements OnInit {
  alumnos: alumno[] = [];
  loading: boolean = true;

  mostrarTodosUsuarios: boolean = false;
  mostrarTodosProyectos: boolean = false;
  modalidades: any[] = [];
  usuariosExpandidos: Set<number> = new Set();
  proyectosPorUsuario: Map<number, proyecto[]> = new Map();
  loadingProyectosUsuario: Map<number, boolean> = new Map();
  private modalidadService = inject(ModalidadService);
  // ── FIX: mapa usuarioId → alumnoId para cruzar usuarios con asistencia ──────
  private usuarioIdToAlumnoId: Map<number, number> = new Map();
  // ── Fichaje del administrador ──────────────────────────────────────────────
  mostrarTarjetaAsistencia = false;
  isExiting = false;
  nombreUsuario = '';
  asistenciaHoy: any = null;
  horarioHoy: { horaInicio: string; horaFin: string } | null = null;
  franjaActiva: 'activa' | null = null;
  mostrarFormHorario = false;
  guardandoHorario = false;
  adminIdReal: number | null = null;
  formHorario = { diaSemana: '', horaInicio: '', horaFin: '' };
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Proyectos
  proyectos: proyecto[] = [];
  filtroProyectos: proyecto[] = [];
  loadingProyectos: boolean = true;
  textoBusquedaProyecto: string = '';
  filtroEstado: string = '';

  // Modal proyecto
  modalProyectoAbierto: boolean = false;
  proyectoEditando: proyecto | null = null;
  guardandoProyecto: boolean = false;
  formProyecto: {
    titulo: string; descripcion: string; estado: EstadoProyecto;
    fotoProyecto: string | null; videoUrl: string
  } =
    { titulo: '', descripcion: '', estado: 'en curso', fotoProyecto: null, videoUrl: '' };
  @ViewChild('inputImagen') inputImagenRef!: ElementRef<HTMLInputElement>;

  // Usuarios
  usuarios: Usuario[] = [];
  filtroUsuarios: Usuario[] = [];
  loadingUsuarios: boolean = true;
  textoBusqueda: string = '';
  filtroRol: string = '';
  filtroFichado: string = '';
  // Set con los alumnoId que han fichado hoy
  fichadosHoyIds: Set<number> = new Set();
  fichadosHoyMap: Map<number, AsistenciaDTO> = new Map();

  // Modal edición individual
  modalEdicionAbierto: boolean = false;
  usuarioEditando: Usuario |
    null = null;
  guardandoEdicion: boolean = false;
  formEdicion = { nombreReal: '', nombreUsuario: '', rol: '', contrasenaHash: '' };
  // Modal cambio masivo de rol
  modalCambioMasivoAbierto: boolean = false;
  seleccionadosMasivo: number[] = [];
  rolMasivoDestino: string = 'admin';
  guardandoCambioMasivo: boolean = false;
  busquedaMasivo: string = '';
  usuariosFiltradosMasivo: Usuario[] = [];
  // ── AFK ──────────────────────────────────────────────────────
  registrosAfk: RegistroActividad[] = [];
  loadingAfk: boolean = true;
  mostrarTodosAfk: boolean = false;

  // ── TAREAS DE PROYECTO (admin) ────────────────────────────────────────────
  formTareas: string[] = [];          // títulos editables en el modal
  guardandoTareas: boolean = false;
  private asistenciaService = inject(AsistenciaService);
  private authService = inject(AuthService);
  private registroActividadService = inject(RegistroActividadService);
  private tareaService = inject(TareaService);

  constructor(
    private alumnoService: AlumnoService,
    private usuarioService: UsuarioService,
    private proyectoService: ProyectoService,
    private toastController: ToastController
  ) {
    addIcons({
      peopleOutline, businessOutline, personAddOutline,
      settingsOutline, searchOutline, schoolOutline,
      statsChartOutline, listOutline, pencilOutline, trashOutline,
      personOutline, shieldCheckmarkOutline, readerOutline,
      closeOutline, checkmarkOutline, hourglassOutline,
      peopleCircleOutline, checkboxOutline, squareOutline,
      addOutline, createOutline, addCircleOutline, folderOpenOutline,
      playCircleOutline, pauseCircleOutline, checkmarkCircleOutline,
      imageOutline, timeOutline, logInOutline, logOutOutline, calendarOutline, saveOutline,
      checkmarkDoneCircle,
      reorderThreeOutline, informationCircleOutline,
      // ── AFK ────────────────────────────────────────────────
      closeCircleOutline, checkmarkDoneCircleOutline,
      chevronUpOutline, chevronDownOutline
    });
  }

  ngOnInit() {
    this.authService.sesion$.subscribe(sesion => {
      this.nombreUsuario = sesion?.nombreReal ?? 'Administrador';
    });
    this.cargarModalidades();
    this.cargarAlumnosYUsuarios();
    this.cargarProyectos();
    this.cargarHorarioYFichaje();
    this.cargarRegistrosAfkHoy(); // ── AFK
  }

  // ─────────────────────────────────────────────────────────────
  // CARGA CONJUNTA alumnos + usuarios
  // ─────────────────────────────────────────────────────────────
  cargarAlumnosYUsuarios() {
    this.loading = true;
    this.loadingUsuarios = true;

    forkJoin({
      alumnos: this.alumnoService.getAlumnos().pipe(timeout(8000), catchError(() => of([]))),
      usuarios: this.usuarioService.getUsuarios().pipe(timeout(8000), catchError(() => of([])))
    }).subscribe({
      next: ({ alumnos, usuarios }) => {
        this.alumnos = alumnos;

        this.usuarioIdToAlumnoId = new Map(
          alumnos
            .filter(a => a.id != null && ((a as any).usuarioId ?? (a as any).usuario_id) != null)
            .map(a => [(a as any).usuarioId ?? (a as any).usuario_id, a.id] as [number, number])
        );

        this.usuarios = usuarios;
        this.loading = false;
        this.loadingUsuarios = false;

        // Poblar filtroUsuarios inmediatamente para que el template no quede vacío
        this.aplicarFiltros();
        this.cargarFichadosHoy();
      },
      error: () => {
        this.mostrarToast('Error cargando datos de usuarios', 'danger');
        this.loading = false;
        this.loadingUsuarios = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // FICHADOS HOY
  // ─────────────────────────────────────────────────────────────
  cargarFichadosHoy() {
    this.asistenciaService.fichadosHoy().subscribe({
      next: (lista) => {
        this.fichadosHoyIds = new Set(
          lista.filter(a => !!a.presente).map(a => a.alumnoId)
        );
        this.fichadosHoyMap = new Map(
          lista.filter(a => !!a.presente).map(a => [a.alumnoId, a])
        );
        this.aplicarFiltros();
      },
      error: () => { /* silencioso */ }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // FICHAJE DEL ADMINISTRADOR
  // ─────────────────────────────────────────────────────────────
  cargarHorarioYFichaje() {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    const diasSemanaMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaHoy = diasSemanaMap[new Date().getDay()];
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    this.alumnoService.getAlumnoByUsuarioId(sesion.id).subscribe({
      next: (alumno: any) => {
        console.log('[DEBUG] Respuesta getAlumnoByUsuarioId (admin):', JSON.stringify(alumno));

        const adminId: number = alumno.alumnoId ?? alumno.id;
        if (!adminId) {
          this.mostrarTarjetaAsistencia = false;
          return;
        }

        this.adminIdReal = adminId;
        this.formHorario.diaSemana = diaHoy;

        this.asistenciaService.haFichadoHoy(adminId).subscribe({
          next: (asistencia) => {
            this.asistenciaHoy = asistencia;
            this.mostrarTarjetaAsistencia = true;
            this.cargarHorarioParaAdmin(adminId, diaHoy, horaActual);
          },
          error: () => {
            this.asistenciaHoy = null;
            this.mostrarTarjetaAsistencia = true;
            this.cargarHorarioParaAdmin(adminId, diaHoy, horaActual);
          }
        });
      },
      error: () => {
        this.mostrarTarjetaAsistencia = false;
      }
    });
  }

  cargarHorarioParaAdmin(adminId: number, diaHoy: string, horaActual: number) {
    this.alumnoService.getHorarioAlumno(adminId).subscribe({
      next: (horarios: any[]) => {
        const horariosHoy = horarios.filter((h: any) =>
          h.diaSemana?.toLowerCase() === diaHoy.toLowerCase()
        );

        if (horariosHoy.length === 0) {
          this.horarioHoy = null;
          this.franjaActiva = null;
          this.mostrarFormHorario = true;
          return;
        }

        this.mostrarFormHorario = false;
        horariosHoy.sort((a: any, b: any) => {
          const [aH, aM] = a.horaInicio.split(':').map(Number);
          const [bH, bM] = b.horaInicio.split(':').map(Number);
          return (aH * 60 + aM) - (bH * 60 + bM);
        });

        const activo = horariosHoy.find((h: any) => {
          const [hiH, hiM] = h.horaInicio.split(':').map(Number);
          const [hfH, hfM] = h.horaFin.split(':').map(Number);
          return horaActual >= (hiH * 60 + hiM) && horaActual <= (hfH * 60 + hfM);
        });

        if (activo) {
          this.horarioHoy = { horaInicio: activo.horaInicio, horaFin: activo.horaFin };
          this.franjaActiva = 'activa';
        } else {
          const proximo = horariosHoy[0];
          this.horarioHoy = { horaInicio: proximo.horaInicio, horaFin: proximo.horaFin };
          this.franjaActiva = null;
        }
      },
      error: () => {
        this.horarioHoy = { horaInicio: '08:00', horaFin: '15:00' };
        this.franjaActiva = 'activa';
      }
    });
  }

  async guardarHorario() {
    if (!this.adminIdReal || !this.formHorario.diaSemana ||
      !this.formHorario.horaInicio || !this.formHorario.horaFin) {
      await this.mostrarToast('Rellena todos los campos del horario', 'warning');
      return;
    }

    this.guardandoHorario = true;

    const payload = {
      alumnoId: this.adminIdReal,
      diaSemana: this.formHorario.diaSemana,
      horaInicio: this.formHorario.horaInicio,
      horaFin: this.formHorario.horaFin
    };
    this.alumnoService.crearHorario(payload).subscribe({
      next: async () => {
        this.guardandoHorario = false;
        await this.mostrarToast('✅ Horario guardado correctamente', 'success');
        this.cargarHorarioYFichaje();
      },
      error: async () => {
        this.guardandoHorario = false;
        await this.mostrarToast('❌ Error al guardar el horario', 'danger');
      }
    });
  }

  async fichar() {
    if (!this.adminIdReal) return;
    this.asistenciaService.fichar(this.adminIdReal).subscribe({
      next: async () => {
        await this.mostrarToast('✅ Entrada registrada correctamente', 'success');
        this.cargarHorarioYFichaje();
        this.cargarFichadosHoy();
      },
      error: async () => {
        await this.mostrarToast('❌ Error al registrar la entrada', 'danger');
      }
    });
  }

  async desfichar() {
    if (!this.adminIdReal) return;
    this.asistenciaService.ficharSalida(this.adminIdReal).subscribe({
      next: async () => {
        await this.mostrarToast('✅ Salida registrada correctamente. ¡Buen trabajo hoy! 🚀', 'success');
        this.cargarHorarioYFichaje();
        this.cargarFichadosHoy();
      },
      error: async (err) => {
        const mensaje = err?.error?.message ?? 'Error al registrar la salida';
        await this.mostrarToast(`❌ ${mensaje}`, 'danger');
      }
    });
  }

  // AHORA: convierte usuario.id → alumnoId usando el mapa y comprueba el Set

  // ─────────────────────────────────────────────────────────────
  // haFichadoHoy
  // ─────────────────────────────────────────────────────────────
  haFichadoHoy(usuarioId: number): boolean {
    const alumnoId = this.usuarioIdToAlumnoId.get(usuarioId);
    if (alumnoId === undefined) return false;
    return this.fichadosHoyIds.has(alumnoId);
  }

  obtenerAsistenciaAlumno(usuarioId: number): AsistenciaDTO | null {
    const alumnoId = this.usuarioIdToAlumnoId.get(usuarioId);
    if (alumnoId === undefined) return null;
    return this.fichadosHoyMap.get(alumnoId) || null;
  }

  // ─────────────────────────────────────────────────────────────
  // PROYECTOS
  // ─────────────────────────────────────────────────────────────
  cargarProyectos() {
    this.loadingProyectos = true;
    this.proyectoService.getProyectos().pipe(
      timeout(8000),
      catchError(() => {
        this.mostrarToast('Error cargando proyectos', 'danger');
        this.loadingProyectos = false;
        return of([]);
      })
    ).subscribe({
      next: (res) => {
        this.proyectos = res;
        this.aplicarFiltrosProyectos();
        this.loadingProyectos = false;
      },
      error: () => {
        this.mostrarToast('Error cargando proyectos', 'danger');
        this.loadingProyectos = false;
      }
    });
  }

  buscarProyecto(event: any) {
    this.textoBusquedaProyecto = event.target.value?.toLowerCase() ?? '';
    this.aplicarFiltrosProyectos();
  }

  filtrarPorEstado(estado: string) {
    this.filtroEstado = estado;
    this.aplicarFiltrosProyectos();
  }

  private aplicarFiltrosProyectos() {
    let res = [...this.proyectos];
    if (this.filtroEstado) {
      res = res.filter(p => p.estado === this.filtroEstado);
    }
    if (this.textoBusquedaProyecto.trim()) {
      res = res.filter(p => p.titulo?.toLowerCase().includes(this.textoBusquedaProyecto));
    }
    this.filtroProyectos = res;
  }

  getIconoPorEstado(estado: string): string {
    switch (estado) {
      case 'en curso': return 'play-circle-outline';
      case 'pausado': return 'pause-circle-outline';
      case 'finalizado': return 'checkmark-circle-outline';
      default: return 'folder-open-outline';
    }
  }

  abrirModalProyecto(p: proyecto | null) {
    this.proyectoEditando = p;
    this.formProyecto = {
      titulo: p?.titulo || '',
      descripcion: p?.descripcion || '',
      estado: p?.estado || 'en curso',
      fotoProyecto: p?.fotoProyecto || null,
      videoUrl: p?.videoUrl || ''
    };
    this.formTareas = [];
    this.guardandoProyecto = false;
    this.modalProyectoAbierto = true;
    if (p?.id) this.cargarTareasEnForm(p.id);
  }

  cerrarModalProyecto() {
    this.modalProyectoAbierto = false;
    this.proyectoEditando = null;
    this.guardandoProyecto = false;
    this.formTareas = [];
  }

  guardarProyecto() {
    if (!this.formProyecto.titulo.trim()) return;
    this.guardandoProyecto = true;
    const payload: Partial<proyecto> = {
      titulo: this.formProyecto.titulo,
      descripcion: this.formProyecto.descripcion,
      estado: this.formProyecto.estado,
      fotoProyecto: this.formProyecto.fotoProyecto || null,
      videoUrl: this.formProyecto.videoUrl || '',
    };
    if (this.proyectoEditando) {
      this.proyectoService.actualizarProyecto(this.proyectoEditando.id, payload).subscribe({
        next: async (actualizado) => {
          const idx = this.proyectos.findIndex(p => p.id === this.proyectoEditando!.id);
          if (idx !== -1) this.proyectos[idx] = { ...this.proyectos[idx], ...actualizado };
          this.aplicarFiltrosProyectos();
          await this.guardarTareasDelProyecto(actualizado.id).catch(() => {});
          this.mostrarToast('Proyecto actualizado correctamente', 'success');
          this.cerrarModalProyecto();
        },
        error: () => {
          this.mostrarToast('Error al actualizar el proyecto', 'danger');
          this.guardandoProyecto = false;
        }
      });
    } else {
      this.proyectoService.crearProyecto(payload).subscribe({
        next: async (nuevo) => {
          this.proyectos.unshift(nuevo);
          this.aplicarFiltrosProyectos();
          await this.guardarTareasDelProyecto(nuevo.id).catch(() => {});
          this.mostrarToast('Proyecto creado correctamente', 'success');
          this.cerrarModalProyecto();
        },
        error: () => {
          this.mostrarToast('Error al crear el proyecto', 'danger');
          this.guardandoProyecto = false;
        }
      });
    }
  }

  eliminarProyecto(id: number) {
    this.proyectoService.eliminarProyecto(id).subscribe({
      next: () => {
        this.proyectos = this.proyectos.filter(p => p.id !== id);
        this.aplicarFiltrosProyectos();
        this.mostrarToast('Proyecto eliminado correctamente', 'success');
      },
      error: () => this.mostrarToast('Error al eliminar el proyecto', 'danger')
    });
  }

  // ─────────────────────────────────────────────────────────────
  // USUARIOS Y FILTROS
  // ─────────────────────────────────────────────────────────────
  buscarUsuario(event: any) {
    this.textoBusqueda = event.target.value?.toLowerCase() ?? '';
    this.aplicarFiltros();
  }

  filtrarPorRol(rol: string) {
    this.filtroRol = rol;
    this.aplicarFiltros();
  }

  filtrarPorFichado(estado: string) {
    this.filtroFichado = estado;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let resultado = [...this.usuarios];
    if (this.filtroRol) {
      resultado = resultado.filter(u => u.rol?.toLowerCase() === this.filtroRol.toLowerCase());
    }
    if (this.filtroFichado === 'fichado') {
      resultado = resultado.filter(u => this.haFichadoHoy(u.id));
    } else if (this.filtroFichado === 'no-fichado') {
      resultado = resultado.filter(u => !this.haFichadoHoy(u.id));
    }
    if (this.textoBusqueda.trim()) {
      resultado = resultado.filter(u =>
        u.nombreReal?.toLowerCase().includes(this.textoBusqueda) ||
        u.id?.toString().includes(this.textoBusqueda)
      );
    }
    this.filtroUsuarios = resultado;
  }

  eliminarUsuario(id: number) {
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
        this.usuarioIdToAlumnoId.delete(id);
        this.aplicarFiltros();
        this.mostrarToast('Usuario eliminado correctamente', 'success');
      },
      error: () => this.mostrarToast('Error al eliminar el usuario', 'danger')
    });
  }

  cargarModalidades() {
    this.modalidadService.getModalidades().subscribe({
      next: (modalidades) => {
        this.modalidades = modalidades;
      }
    });
  }

  toggleUsuarioExpandido(u: Usuario) {
    if (this.usuariosExpandidos.has(u.id)) {
      this.usuariosExpandidos.delete(u.id);
    } else {
      this.usuariosExpandidos.add(u.id);
      if (u.rol === 'alumno') {
        const alumnoId = this.usuarioIdToAlumnoId.get(u.id);
        if (alumnoId != null && !this.proyectosPorUsuario.has(u.id)) {
          this.loadingProyectosUsuario.set(u.id, true);
          this.proyectoService.getProyectosPorAlumno(alumnoId).subscribe({
            next: (proyectos) => {
              this.proyectosPorUsuario.set(u.id, proyectos);
              this.loadingProyectosUsuario.set(u.id, false);
            },
            error: () => {
              this.proyectosPorUsuario.set(u.id, []);
              this.loadingProyectosUsuario.set(u.id, false);
              this.mostrarToast('Error al cargar proyectos del usuario', 'danger');
            }
          });
        }
      }
    }
  }

  isUsuarioExpandido(u: Usuario): boolean {
    return this.usuariosExpandidos.has(u.id);
  }

  getProyectosUsuario(u: Usuario): proyecto[] {
    return this.proyectosPorUsuario.get(u.id) || [];
  }

  isLoadingProyectosUsuario(u: Usuario): boolean {
    return this.loadingProyectosUsuario.get(u.id) || false;
  }

  get alumnosSolo(): Usuario[] {
    return this.filtroUsuarios.filter(u => u.rol?.toLowerCase() === 'alumno');
  }

  guardarUsuarioInline(u: Usuario) {
    if (!u.nombreReal?.trim() || !u.nombreUsuario?.trim()) {
      this.mostrarToast('Por favor completa todos los campos del usuario', 'warning');
      return;
    }
    const payload = {
      nombreReal: u.nombreReal,
      nombreUsuario: u.nombreUsuario,
      rol: u.rol
    };
    this.usuarioService.actualizarUsuario(u.id, payload).subscribe({
      next: (actualizado) => {
        // Actualizar en la lista local
        const idx = this.usuarios.findIndex(user => user.id === u.id);
        if (idx !== -1) {
          this.usuarios[idx] = { ...this.usuarios[idx], ...actualizado };
        }

        // Si el rol es alumno y tiene modalidadId, actualizar modalidad
        if (u.rol === 'alumno' && u.modalidadId) {
          this.usuarioService.actualizarModalidad(u.id, u.modalidadId).subscribe({
            next: () => {
              this.mostrarToast('✅ Usuario y modalidad actualizados con éxito', 'success');
              this.cargarAlumnosYUsuarios();
            },
            error: () => {
              this.mostrarToast('⚠️ Usuario actualizado, pero falló la modalidad', 'warning');
            }
          });
        } else {
          this.mostrarToast('✅ Usuario actualizado con éxito', 'success');
          this.cargarAlumnosYUsuarios();
        }
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al actualizar el usuario';
        this.mostrarToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  getImagenProyecto(p: proyecto): string {
    return `https://picsum.photos/seed/${p.id}/600/400`;
  }

  getClaseEstado(estado: string): string {
    return 'estado-' + (estado ?? '').replace(/ /g, '-');
  }

  getIconoPorRol(rol: string): string {
    switch (rol?.toLowerCase()) {
      case 'admin':
      case 'administrador': return 'shield-checkmark-outline';
      case 'profesor': return 'reader-outline';
      default: return 'person-outline';
    }
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  // ─────────────────────────────────────────────────────────────
  // MODAL EDICIÓN INDIVIDUAL
  // ─────────────────────────────────────────────────────────────
  abrirModalEdicion(usuario: Usuario) {
    this.usuarioEditando = usuario;
    this.formEdicion = {
      nombreReal: usuario.nombreReal ?? '',
      nombreUsuario: (usuario as any).nombreUsuario ?? '',
      rol: usuario.rol ?? '',
      contrasenaHash: ''
    };
    this.modalEdicionAbierto = true;
  }

  cerrarModalEdicion() {
    this.modalEdicionAbierto = false;
    this.usuarioEditando = null;
    this.guardandoEdicion = false;
  }

  guardarEdicion() {
    if (!this.usuarioEditando) return;
    this.guardandoEdicion = true;
    const payload: any = {
      nombreReal: this.formEdicion.nombreReal,
      nombreUsuario: this.formEdicion.nombreUsuario,
      rol: this.formEdicion.rol,
    };
    if (this.formEdicion.contrasenaHash.trim()) {
      payload.contrasenaHash = this.formEdicion.contrasenaHash;
    }

    this.usuarioService.actualizarUsuario(this.usuarioEditando.id, payload).subscribe({
      next: (actualizado) => {
        const idx = this.usuarios.findIndex(u => u.id === this.usuarioEditando!.id);
        if (idx !== -1) {
          this.usuarios[idx] = { ...this.usuarios[idx], ...actualizado };
        }
        this.aplicarFiltros();
        this.mostrarToast('Usuario actualizado correctamente', 'success');
        this.cerrarModalEdicion();
      },
      error: () => {
        this.mostrarToast('Error al actualizar el usuario', 'danger');
        this.guardandoEdicion = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // MODAL CAMBIO MASIVO DE ROL
  // ─────────────────────────────────────────────────────────────
  abrirModalCambioMasivoRol() {
    this.seleccionadosMasivo = [];
    this.rolMasivoDestino = 'admin';
    this.guardandoCambioMasivo = false;
    this.busquedaMasivo = '';
    this.usuariosFiltradosMasivo = [...this.usuarios];
    this.modalCambioMasivoAbierto = true;
  }

  cerrarModalCambioMasivoRol() {
    this.modalCambioMasivoAbierto = false;
    this.seleccionadosMasivo = [];
    this.busquedaMasivo = '';
    this.guardandoCambioMasivo = false;
  }

  filtrarUsuariosMasivo() {
    const q = this.busquedaMasivo.toLowerCase().trim();
    this.usuariosFiltradosMasivo = q
      ? this.usuarios.filter(u =>
        u.nombreReal?.toLowerCase().includes(q) ||
        u.id?.toString().includes(q)
      )
      : [...this.usuarios];
  }

  limpiarBusquedaMasivo() {
    this.busquedaMasivo = '';
    this.usuariosFiltradosMasivo = [...this.usuarios];
  }

  estaSeleccionadoMasivo(id: number): boolean {
    return this.seleccionadosMasivo.includes(id);
  }

  toggleSeleccionMasivo(id: number) {
    const idx = this.seleccionadosMasivo.indexOf(id);
    if (idx === -1) {
      this.seleccionadosMasivo = [...this.seleccionadosMasivo, id];
    } else {
      this.seleccionadosMasivo = this.seleccionadosMasivo.filter(x => x !== id);
    }
  }

  seleccionarTodosMasivo() {
    this.seleccionadosMasivo = this.usuarios.map(u => u.id);
  }

  deseleccionarTodosMasivo() {
    this.seleccionadosMasivo = [];
  }

  seleccionarPorRolMasivo(rol: string) {
    this.seleccionadosMasivo = this.usuarios
      .filter(u => u.rol?.toLowerCase() === rol)
      .map(u => u.id);
  }

  aplicarCambioMasivoRol() {
    if (this.seleccionadosMasivo.length === 0) return;
    this.guardandoCambioMasivo = true;
    const peticiones = this.seleccionadosMasivo.map(id =>
      this.usuarioService.actualizarUsuario(id, { rol: this.rolMasivoDestino })
    );
    forkJoin(peticiones).subscribe({
      next: (resultados) => {
        resultados.forEach((actualizado: any) => {
          const idx = this.usuarios.findIndex(u => u.id === actualizado.id);
          if (idx !== -1) {
            this.usuarios[idx] = { ...this.usuarios[idx], ...actualizado };
          }
        });
        this.aplicarFiltros();
        this.mostrarToast(
          `${this.seleccionadosMasivo.length} usuario${this.seleccionadosMasivo.length !== 1 ? 's' : ''} actualizado${this.seleccionadosMasivo.length !== 1 ? 's' : ''} a "${this.rolMasivoDestino}"`,
          'success'
        );
        this.cerrarModalCambioMasivoRol();
      },
      error: () => {
        this.mostrarToast('Error al aplicar el cambio masivo de rol', 'danger');
        this.guardandoCambioMasivo = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // IMAGEN PROYECTO
  // ─────────────────────────────────────────────────────────────
  triggerInputImagen() {
    this.inputImagenRef?.nativeElement.click();
  }

  onImagenSeleccionada(event: Event) {
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

  quitarImagenProyecto(event: Event) {
    event.stopPropagation();
    this.formProyecto.fotoProyecto = '';
  }

  getModalidadTexto(mod: number): string {
    return mod === 1 ? 'Presencial' : 'Remoto';
  }

  toggleMostrarTodosUsuarios() {
    this.mostrarTodosUsuarios = !this.mostrarTodosUsuarios;
  }

  toggleMostrarTodosProyectos() {
    this.mostrarTodosProyectos = !this.mostrarTodosProyectos;
  }

  // ─────────────────────────────────────────────────────────────
  // ACTIVIDAD ANTI-AFK
  // ─────────────────────────────────────────────────────────────
  cargarRegistrosAfkHoy() {
    this.loadingAfk = true;
    this.registroActividadService.getHoy().subscribe({
      next: (registros) => {
        const unicos = new Map<number, RegistroActividad>();
        for (const r of registros) {
          if (!unicos.has(r.usuarioId)) {
            unicos.set(r.usuarioId, r);
          }
        }
        this.registrosAfk = Array.from(unicos.values());
        this.loadingAfk = false;
      },
      error: () => {
        this.loadingAfk = false;
      }
    });
  }

  getNombrePorUsuarioId(usuarioId: number): string {
    const u = this.usuarios.find(u => u.id === usuarioId);
    return u?.nombreReal ?? `Usuario #${usuarioId}`;
  }

  getIconoPorUsuarioId(usuarioId: number): string {
    const u = this.usuarios.find(u => u.id === usuarioId);
    return this.getIconoPorRol(u?.rol ?? '');
  }

  // ─────────────────────────────────────────────────────────────
  // TAREAS DE PROYECTO — ADMIN
  // ─────────────────────────────────────────────────────────────

  /** Carga las tareas existentes al abrir el modal de edición */
  private cargarTareasEnForm(proyectoId: number) {
    this.tareaService.getTareasPorProyecto(proyectoId).subscribe({
      next: (tareas) => {
        this.formTareas = tareas.map(t => t.titulo);
      },
      error: () => this.formTareas = []
    });
  }

  /** Añade una fila vacía (o después del índice indicado) */
  agregarTarea(despuesDeIndex?: number) {
    if (despuesDeIndex !== undefined) {
      this.formTareas.splice(despuesDeIndex + 1, 0, '');
    } else {
      this.formTareas.push('');
    }
    // Focus al nuevo input en el siguiente tick
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.tarea-input');
      const target = despuesDeIndex !== undefined ? despuesDeIndex + 1 : this.formTareas.length - 1;
      inputs[target]?.focus();
    }, 50);
  }

  /** Elimina la fila en el índice indicado */
  quitarTarea(index: number) {
    this.formTareas.splice(index, 1);
  }

  /** Drag & drop reorder (CDK) */
  reordenarTarea(event: any) {
    const { previousIndex, currentIndex } = event;
    const item = this.formTareas.splice(previousIndex, 1)[0];
    this.formTareas.splice(currentIndex, 0, item);
  }

  /** Guarda las tareas al guardar el proyecto */
  private guardarTareasDelProyecto(proyectoId: number): Promise<void> {
    const titulos = this.formTareas.filter(t => t.trim() !== '');
    if (titulos.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.tareaService.guardarTareas(proyectoId, titulos).subscribe({
        next: () => resolve(),
        error: () => reject()
      });
    });
  }
}
