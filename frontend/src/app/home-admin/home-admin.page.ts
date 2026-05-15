import {Component, OnInit, ViewChild, ElementRef, inject} from '@angular/core';
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
  imageOutline, timeOutline, logInOutline, calendarOutline, saveOutline
} from 'ionicons/icons';
import { alumno } from '../modelos/alumno';
import { AlumnoService } from '../services/alumno-service';
import { UsuarioService, Usuario } from '../services/usuario-service';
import { ProyectoService } from '../services/proyecto-service';
import { AsistenciaService } from '../services/asistencia-service';
import { AuthService } from '../services/auth-service';
import { proyecto, EstadoProyecto } from '../modelos/proyecto';
import { HeaderComponent } from '../components/header/header.component';
import { forkJoin } from 'rxjs';

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

  // ── FIX: mapa usuarioId → alumnoId para cruzar usuarios con asistencia ──────
  // La tabla asistencia guarda alumnoId, pero la lista de usuarios usa usuario.id.
  // Sin este mapa, haFichadoHoy() siempre devuelve false porque compara IDs distintos.
  private usuarioIdToAlumnoId: Map<number, number> = new Map();

  // ── Fichaje del administrador ──────────────────────────────────────────────
  mostrarTarjetaAsistencia = false;
  isExiting = false;
  nombreUsuario = '';
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
  formProyecto: { titulo: string; descripcion: string; cupoMaximo: number; estado: EstadoProyecto; fotoProyecto: string | null; videoUrl: string } =
    { titulo: '', descripcion: '', cupoMaximo: 5, estado: 'en curso', fotoProyecto: null, videoUrl: '' };

  @ViewChild('inputImagen') inputImagenRef!: ElementRef<HTMLInputElement>;

  // Usuarios
  usuarios: Usuario[] = [];
  filtroUsuarios: Usuario[] = [];
  loadingUsuarios: boolean = true;
  textoBusqueda: string = '';
  filtroRol: string = '';
  filtroFichado: string = '';

  // Set con los alumnoId que han fichado hoy (viene de la BD)
  fichadosHoyIds: Set<number> = new Set();

  // Modal edición individual
  modalEdicionAbierto: boolean = false;
  usuarioEditando: Usuario | null = null;
  guardandoEdicion: boolean = false;
  formEdicion = { nombreReal: '', nombreUsuario: '', rol: '', contrasenaHash: '' };

  // Modal cambio masivo de rol
  modalCambioMasivoAbierto: boolean = false;
  seleccionadosMasivo: number[] = [];
  rolMasivoDestino: string = 'administrador';
  guardandoCambioMasivo: boolean = false;
  busquedaMasivo: string = '';
  usuariosFiltradosMasivo: Usuario[] = [];

  private asistenciaService = inject(AsistenciaService);
  private authService = inject(AuthService);

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
      imageOutline, timeOutline, logInOutline, calendarOutline, saveOutline
    });
  }

  ngOnInit() {
    this.authService.sesion$.subscribe(sesion => {
      this.nombreUsuario = sesion?.nombreReal ?? 'Administrador';
    });

    // Cargamos alumnos y usuarios juntos para que el mapa esté listo
    // antes de aplicar el filtro de fichados
    this.cargarAlumnosYUsuarios();
    this.cargarProyectos();
    this.cargarHorarioYFichaje();
  }

  // ─────────────────────────────────────────────────────────────
  // CARGA CONJUNTA alumnos + usuarios
  // ─────────────────────────────────────────────────────────────
  // Unificamos en un solo forkJoin para garantizar que el mapa
  // usuarioId→alumnoId existe cuando lleguen los fichados de hoy.
  cargarAlumnosYUsuarios() {
    this.loading = true;
    this.loadingUsuarios = true;

    forkJoin({
      alumnos: this.alumnoService.getAlumnos(),
      usuarios: this.usuarioService.getUsuarios()
    }).subscribe({
      next: ({ alumnos, usuarios }) => {
        this.alumnos = alumnos;

        // ── FIX: construir el mapa usuarioId → alumnoId ──────────────────
        // El backend devuelve el campo como "usuarioId" (camelCase estándar).
        // Si tu entidad lo serializa diferente (ej. "usuario_id"), cámbialo aquí.
        this.usuarioIdToAlumnoId = new Map(
          alumnos
            .filter(a => a.id != null && ((a as any).usuarioId ?? (a as any).usuario_id) != null)
            .map(a => [(a as any).usuarioId ?? (a as any).usuario_id, a.id] as [number, number])
        );

        this.usuarios = usuarios;
        this.loading = false;
        this.loadingUsuarios = false;

        // Ahora que el mapa existe, cargamos los fichados y aplicamos filtros
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
        // Solo se consideran fichados los que tienen presente = 1 (true)
        // Los registros con presente = 0 existen en la BD pero no cuentan como fichado
        this.fichadosHoyIds = new Set(
          lista.filter(a => !!a.presente).map(a => a.alumnoId)
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

        // ── FIX: misma corrección que en home.page.ts ────────────────────
        const adminId: number = alumno.alumnoId ?? alumno.id;
        if (!adminId) {
          this.mostrarTarjetaAsistencia = false;
          return;
        }

        this.adminIdReal = adminId;
        this.formHorario.diaSemana = diaHoy;

        this.asistenciaService.haFichadoHoy(adminId).subscribe({
          next: () => {
            this.mostrarTarjetaAsistencia = false;
          },
          error: () => {
            this.alumnoService.getHorarioAlumno(adminId).subscribe({
              next: (horarios: any[]) => {
                const horariosHoy = horarios.filter((h: any) =>
                  h.diaSemana?.toLowerCase() === diaHoy.toLowerCase()
                );

                if (horariosHoy.length === 0) {
                  this.horarioHoy = null;
                  this.franjaActiva = null;
                  this.mostrarFormHorario = true;
                  this.mostrarTarjetaAsistencia = true;
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
                this.mostrarTarjetaAsistencia = true;
              },
              error: () => {
                this.horarioHoy = { horaInicio: '08:00', horaFin: '15:00' };
                this.franjaActiva = 'activa';
                this.mostrarTarjetaAsistencia = true;
              }
            });
          }
        });
      },
      error: () => {
        // El administrador no tiene fila en alumno → ocultar tarjeta
        this.mostrarTarjetaAsistencia = false;
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
        await this.mostrarToast('✅ Te has fichado correctamente', 'success');
        this.isExiting = true;
        setTimeout(() => this.mostrarTarjetaAsistencia = false, 500);
        this.cargarFichadosHoy();
      },
      error: async () => {
        await this.mostrarToast('❌ Error al registrar el fichaje', 'danger');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // haFichadoHoy — FIX PRINCIPAL
  // ─────────────────────────────────────────────────────────────
  // ANTES: comparaba usuario.id contra Set de alumnoId → siempre false
  // AHORA: convierte usuario.id → alumnoId usando el mapa y comprueba el Set
  haFichadoHoy(usuarioId: number): boolean {
    const alumnoId = this.usuarioIdToAlumnoId.get(usuarioId);
    if (alumnoId === undefined) return false;
    return this.fichadosHoyIds.has(alumnoId);
  }

  // ─────────────────────────────────────────────────────────────
  // PROYECTOS
  // ─────────────────────────────────────────────────────────────
  cargarProyectos() {
    this.loadingProyectos = true;
    this.proyectoService.getProyectos().subscribe({
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
      case 'en curso':   return 'play-circle-outline';
      case 'pausado':    return 'pause-circle-outline';
      case 'finalizado': return 'checkmark-circle-outline';
      default:           return 'folder-open-outline';
    }
  }

  abrirModalProyecto(p: proyecto | null) {
    this.proyectoEditando = p;
    this.formProyecto = {
      titulo: p?.titulo || '',
      descripcion: p?.descripcion || '',
      cupoMaximo: p?.cupoMaximo || 1,
      estado: p?.estado || 'en curso',
      fotoProyecto: p?.fotoProyecto || null,
      videoUrl: p?.videoUrl || ''   // ← añade esto
    };
    this.guardandoProyecto = false;
    this.modalProyectoAbierto = true;
  }

  cerrarModalProyecto() {
    this.modalProyectoAbierto = false;
    this.proyectoEditando = null;
    this.guardandoProyecto = false;
  }

  guardarProyecto() {
    if (!this.formProyecto.titulo.trim()) return;
    this.guardandoProyecto = true;

    const payload: Partial<proyecto> = {
      titulo:       this.formProyecto.titulo,
      descripcion:  this.formProyecto.descripcion,
      cupoMaximo:   this.formProyecto.cupoMaximo,
      estado:       this.formProyecto.estado,
      fotoProyecto: this.formProyecto.fotoProyecto || null,
      videoUrl:     this.formProyecto.videoUrl || '',
    };

    if (this.proyectoEditando) {
      this.proyectoService.actualizarProyecto(this.proyectoEditando.id, payload).subscribe({
        next: (actualizado) => {
          const idx = this.proyectos.findIndex(p => p.id === this.proyectoEditando!.id);
          if (idx !== -1) this.proyectos[idx] = { ...this.proyectos[idx], ...actualizado };
          this.aplicarFiltrosProyectos();
          this.mostrarToast('Proyecto actualizado correctamente', 'success');
          this.cerrarModalProyecto();
        },
        error: () => { this.mostrarToast('Error al actualizar el proyecto', 'danger'); this.guardandoProyecto = false; }
      });
    } else {
      this.proyectoService.crearProyecto(payload).subscribe({
        next: (nuevo) => {
          this.proyectos.unshift(nuevo);
          this.aplicarFiltrosProyectos();
          this.mostrarToast('Proyecto creado correctamente', 'success');
          this.cerrarModalProyecto();
        },
        error: () => { this.mostrarToast('Error al crear el proyecto', 'danger'); this.guardandoProyecto = false; }
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
        // También limpiar del mapa
        this.usuarioIdToAlumnoId.delete(id);
        this.aplicarFiltros();
        this.mostrarToast('Usuario eliminado correctamente', 'success');
      },
      error: () => this.mostrarToast('Error al eliminar el usuario', 'danger')
    });
  }

  getIconoPorRol(rol: string): string {
    switch (rol?.toLowerCase()) {
      case 'administrador': return 'shield-checkmark-outline';
      case 'profesor':      return 'reader-outline';
      default:              return 'person-outline';
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
    this.rolMasivoDestino = 'administrador';
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
}
