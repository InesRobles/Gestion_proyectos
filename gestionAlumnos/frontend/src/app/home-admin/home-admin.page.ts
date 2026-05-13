import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonProgressBar, ToastController,
  IonSearchbar, IonCardSubtitle
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
  playCircleOutline, pauseCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { alumno } from '../modelos/alumno';
import { AlumnoService } from '../services/alumno-service';
import { UsuarioService, Usuario } from '../services/usuario-service';
import { ProyectoService } from '../services/proyecto-service';
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
  ]
})
export class HomeAdminPage implements OnInit {
  alumnos: alumno[] = [];
  loading: boolean = true;

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
  formProyecto = { titulo: '', descripcion: '', cupoMaximo: 5, estado: 'en curso' as EstadoProyecto };

  // Usuarios
  usuarios: Usuario[] = [];
  filtroUsuarios: Usuario[] = [];
  loadingUsuarios: boolean = true;
  textoBusqueda: string = '';
  filtroRol: string = '';

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
      playCircleOutline, pauseCircleOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.cargarAlumnos();
    this.cargarUsuarios();
    this.cargarProyectos();
  }

  cargarAlumnos() {
    this.loading = true;
    this.alumnoService.getAlumnos().subscribe({
      next: (res) => { this.alumnos = res; this.loading = false; },
      error: () => { this.mostrarToast('Error cargando alumnos', 'danger'); this.loading = false; }
    });
  }

  // ─── Proyectos ───────────────────────────────────────────────────────────────

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
    this.formProyecto = p
      ? { titulo: p.titulo, descripcion: p.descripcion, cupoMaximo: p.cupoMaximo, estado: p.estado }
      : { titulo: '', descripcion: '', cupoMaximo: 5, estado: 'en curso' };
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
      titulo:      this.formProyecto.titulo,
      descripcion: this.formProyecto.descripcion,
      cupoMaximo:  this.formProyecto.cupoMaximo,
      estado:      this.formProyecto.estado,
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

  cargarUsuarios() {
    this.loadingUsuarios = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.aplicarFiltros();
        this.loadingUsuarios = false;
      },
      error: () => {
        this.mostrarToast('Error cargando usuarios', 'danger');
        this.loadingUsuarios = false;
      }
    });
  }

  buscarUsuario(event: any) {
    this.textoBusqueda = event.target.value?.toLowerCase() ?? '';
    this.aplicarFiltros();
  }

  filtrarPorRol(rol: string) {
    this.filtroRol = rol;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let resultado = [...this.usuarios];
    if (this.filtroRol) {
      resultado = resultado.filter(u => u.rol?.toLowerCase() === this.filtroRol.toLowerCase());
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

  // ─── Modal edición individual ────────────────────────────────────────────────

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

  // ─── Modal cambio masivo de rol ──────────────────────────────────────────────

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

  getModalidadTexto(mod: number): string {
    return mod === 1 ? 'Presencial' : 'Remoto';
  }
}
