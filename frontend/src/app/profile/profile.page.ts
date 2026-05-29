import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonList, IonItem, IonInput, IonModal,
  IonLabel, IonToggle, NavController, ToastController, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, personOutline, closeOutline, schoolOutline, lockClosedOutline, exitOutline,
  timeOutline, shieldCheckmarkOutline, desktopOutline, addOutline, trashOutline, folderOpenOutline, briefcaseOutline, peopleOutline,
  moonOutline, sunnyOutline, saveOutline, settingsOutline,
  createOutline, playCircleOutline, logoGithub, documentOutline, imageOutline, statsChartOutline,
  closeCircleOutline, chatbubblesOutline, hourglassOutline, chatbubbleEllipsesOutline, send
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from '../services/auth-service';
import { UsuarioService, Usuario } from '../services/usuario-service';
import { CambioPasswordDTO } from '../services/usuario-service';
import { ModalidadService } from '../services/modalidad-service';
import { ProyectoService } from '../services/proyecto-service';
import { proyecto } from '../modelos/proyecto';
import { ComentarioDTO, ComentarioService } from '../services/comentario-service';
import { AsignacionService } from '../services/asignacion-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard,
    IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonList, IonItem, IonInput, CommonModule, FormsModule,
    RouterLink,
    IonModal, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonLabel, IonToggle, HeaderComponent, IonBadge
  ]
})
export class ProfilePage implements OnInit {

  isPasswordModalOpen = false;
  darkMode = false;
  fotoUrl: string | null = null;
  numProyectos: number = 0;
  proyectosActivos: proyecto[] = [];

  modalidades: { id: number; nombre: string }[] = [];
  modalidadIdSeleccionada: number | null = null;
  nuevaModalidadNombre = '';



  userData = {
    nombre_real: '',
    nombre_usuario: '',
    rol: '',
    modalidad: ''
  };

  securityData = {
    ultimaConexion: 'Hoy a las 10:45 AM',
    dosPasosActivo: false,
    dispositivos: 2
  };

  passwordData = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private modalidadService: ModalidadService,
    private proyectoService: ProyectoService,
    private comentarioService: ComentarioService,
    private asignacionService: AsignacionService,
  ) {
    addIcons({
      personCircle, personOutline, closeOutline, lockClosedOutline, schoolOutline, exitOutline,
      timeOutline, shieldCheckmarkOutline, desktopOutline, addOutline, trashOutline, folderOpenOutline, briefcaseOutline, peopleOutline,
      moonOutline, sunnyOutline, saveOutline, settingsOutline,
      createOutline, playCircleOutline, logoGithub, documentOutline, imageOutline, statsChartOutline,
      closeCircleOutline, chatbubblesOutline, hourglassOutline, chatbubbleEllipsesOutline, send
    });
  }

  ngOnInit(): void {
    // Inicializar estado del dark mode desde el body
    this.darkMode = document.body.classList.contains('ion-palette-dark');

    const sesion = this.authService.obtenerSesion();
    const fotoKey = `profile_foto_${sesion?.id}`;
    const savedFoto = localStorage.getItem(fotoKey);
    if (savedFoto) this.fotoUrl = savedFoto;

    this.cargarModalidades();

    if (!sesion) {
      this.presentToast('No hay sesión activa. Por favor inicia sesión.', 'danger');
      this.navCtrl.navigateRoot('/login');
      return;
    }

    this.userData = {
      nombre_real: sesion.nombreReal,
      nombre_usuario: sesion.nombreUsuario,
      rol: sesion.rol,
      modalidad: ''
    };

    this.usuarioService.getUsuarioById(sesion.id).subscribe({
      next: (usuario) => {
        this.userData = {
          nombre_real: usuario.nombreReal,
          nombre_usuario: usuario.nombreUsuario,
          rol: usuario.rol,
          modalidad: usuario.modalidadNombre ?? usuario.modalidad ?? ''
        };
        if (usuario.modalidadId) {
          this.modalidadIdSeleccionada = usuario.modalidadId;
        }
        if (!this.fotoUrl && (usuario as any).fotoUsuario) {
          this.fotoUrl = (usuario as any).fotoUsuario;
        }

        this.proyectoService.getProyectosPorAlumno(sesion.id).subscribe({
          next: (proyectos) => {
            this.numProyectos = proyectos.length;
            this.proyectosActivos = proyectos.filter(p => p.estado === 'en curso' || p.estado === 'pausado');
          },
          error: () => {
            this.numProyectos = 0;
            this.proyectosActivos = [];
          }
        });
      },
      error: () => {
        this.presentToast('No se pudieron cargar todos los datos del perfil', 'warning');
      }
    });

  }



  // ──────────────────────────────────────────────
  // MODALIDADES
  // ──────────────────────────────────────────────

  cargarModalidades(): void {
    this.modalidadService.getModalidades().subscribe({
      next: (mods) => this.modalidades = mods,
      error: () => this.presentToast('No se pudieron cargar las modalidades', 'warning')
    });
  }

  crearModalidad(): void {
    const nombre = this.nuevaModalidadNombre.trim();
    if (!nombre) return;

    this.modalidadService.crearModalidad(nombre).subscribe({
      next: (nueva) => {
        this.modalidades = [...this.modalidades, nueva];
        this.nuevaModalidadNombre = '';
        this.presentToast(`Modalidad "${nueva.nombre}" creada`, 'success');
      },
      error: (err) => {
        const mensaje = err?.error?.mensaje ?? 'Error al crear la modalidad';
        this.presentToast(mensaje, 'danger');
      }
    });
  }

  eliminarModalidad(id: number): void {
    const modalidad = this.modalidades.find(m => m.id === id);
    if (!modalidad) return;

    this.modalidadService.eliminarModalidad(id).subscribe({
      next: () => {
        this.modalidades = this.modalidades.filter(m => m.id !== id);
        if (this.modalidadIdSeleccionada === id) {
          this.modalidadIdSeleccionada = null;
        }
        this.presentToast(`Modalidad "${modalidad.nombre}" eliminada`, 'success');
      },
      error: (err) => {
        const mensaje = err?.error?.mensaje ?? 'Error al eliminar la modalidad';
        this.presentToast(mensaje, 'danger');
      }
    });
  }

  // ──────────────────────────────────────────────
  // FOTO
  // ──────────────────────────────────────────────

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (file.size > 4 * 1024 * 1024) {
      this.presentToast('La imagen es demasiado grande. Usa una imagen menor de 4MB.', 'warning');
      return;
    }

    this.comprimirImagen(file, 800, 0.75).then((base64Comprimida) => {
      this.fotoUrl = base64Comprimida;
      const sesion = this.authService.obtenerSesion();
      const fotoKey = `profile_foto_${sesion?.id}`;

      try {
        localStorage.setItem(fotoKey, base64Comprimida);
      } catch (e) {
        localStorage.removeItem(fotoKey);
        try { localStorage.setItem(fotoKey, base64Comprimida); } catch (e2) {}
      }

      if (sesion) {
        this.usuarioService.actualizarFoto(sesion.id, base64Comprimida).subscribe({
          next: () => this.presentToast('Foto actualizada correctamente', 'success'),
          error: (err) => {
            console.error('Error al subir foto:', err.status, err.error);
            this.presentToast('Foto guardada localmente (error al subir al servidor)', 'warning');
          }
        });
      }
    }).catch(() => {
      this.presentToast('No se pudo procesar la imagen seleccionada', 'danger');
    });
  }

  private comprimirImagen(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo crear el contexto canvas'));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // ──────────────────────────────────────────────
  // GUARDAR CAMBIOS DE PERFIL
  // ──────────────────────────────────────────────

  async guardarCambios() {
    const sesion = this.authService.obtenerSesion();
    if (!sesion) {
      await this.presentToast('No hay sesión activa', 'danger');
      return;
    }

    if (!this.userData.nombre_real.trim() || !this.userData.nombre_usuario.trim()) {
      await this.presentToast('El nombre real y el nombre de usuario son obligatorios', 'warning');
      return;
    }

    this.usuarioService.actualizarUsuario(sesion.id, {
      nombreReal: this.userData.nombre_real,
      nombreUsuario: this.userData.nombre_usuario,
    }).subscribe({
      next: async () => {
        sesion.nombreReal = this.userData.nombre_real;
        sesion.nombreUsuario = this.userData.nombre_usuario;
        this.authService.guardarSesion(sesion);

        if (sesion.rol === 'alumno' && this.modalidadIdSeleccionada) {
          this.usuarioService.actualizarModalidad(sesion.id, this.modalidadIdSeleccionada).subscribe({
            next: () => {},
            error: () => this.presentToast('Error al actualizar la modalidad', 'warning')
          });
        }

        await this.presentToast('Cambios guardados correctamente', 'success');
      },
      error: async (err) => {
        console.error('Error al guardar cambios:', err.status, err.error);
        const mensaje = err?.error?.mensaje ?? 'Error al guardar los cambios';
        await this.presentToast(mensaje, 'danger');
      }
    });
  }

  // ──────────────────────────────────────────────
  // CAMBIO DE CONTRASEÑA
  // ──────────────────────────────────────────────

  abrirModalPassword() {
    this.passwordData = { actual: '', nueva: '', confirmar: '' };
    this.isPasswordModalOpen = true;
  }

  cerrarModalPassword() {
    this.isPasswordModalOpen = false;
    this.passwordData = { actual: '', nueva: '', confirmar: '' };
  }

  async actualizarPassword() {
    const { actual, nueva, confirmar } = this.passwordData;

    if (!actual || !nueva || !confirmar) {
      await this.presentToast('Por favor, rellena todos los campos', 'warning');
      return;
    }
    if (nueva !== confirmar) {
      await this.presentToast('Las nuevas contraseñas no coinciden', 'danger');
      return;
    }
    if (nueva.length < 6) {
      await this.presentToast('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (actual === nueva) {
      await this.presentToast('La nueva contraseña debe ser diferente a la actual', 'warning');
      return;
    }

    const sesion = this.authService.obtenerSesion();
    if (!sesion) {
      await this.presentToast('No hay sesión activa', 'danger');
      return;
    }

    const dto: CambioPasswordDTO = { contrasenaActual: actual, contrasenaNueva: nueva };

    this.usuarioService.actualizarPassword(sesion.id, dto).subscribe({
      next: async () => {
        await this.presentToast('Contraseña actualizada con éxito', 'success');
        this.isPasswordModalOpen = false;
        this.passwordData = { actual: '', nueva: '', confirmar: '' };
      },
      error: async (err) => {
        console.error('Error al cambiar contraseña — Status:', err.status, 'Body:', err.error);
        let mensaje = 'Error al actualizar la contraseña';
        if (err.status === 400) mensaje = err?.error?.mensaje ?? 'La contraseña actual es incorrecta';
        else if (err.status === 500) mensaje = 'Error interno del servidor. Revisa los logs del backend.';
        await this.presentToast(mensaje, 'danger');
      }
    });
  }

  // ──────────────────────────────────────────────
  // UTILIDADES
  // ──────────────────────────────────────────────

  async presentToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'top'
    });
    await toast.present();
  }



  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('ion-palette-dark');
    } else {
      document.body.classList.remove('ion-palette-dark');
    }
    localStorage.setItem('darkMode', String(this.darkMode));
  }

  onModalidadChange(id: number | null): void {
    const encontrada = this.modalidades.find(m => m.id === id);
    if (encontrada) {
      this.userData.modalidad = encontrada.nombre;
    }
  }

  // ─── MODAL DETALLES DEL PROYECTO ──────────────────────────────────────────
  isModalOpen = false;
  proyectoSeleccionado: any = null;
  esProyectoInscrito = true;
  nuevoComentario: string = '';
  enviandoComentario = false;

  // Chat
  comentarios: ComentarioDTO[] = [];
  loadingComentarios = false;

  // Edición
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

  alumnosDisponibles: Usuario[] = [];
  subiendoRecurso = false;

  @ViewChild('inputImagenEdicion') inputImagenEdicionRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputDocumento') inputDocumentoRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputImagenGaleria') inputImagenGaleriaRef!: ElementRef<HTMLInputElement>;

  verDetalles(p: any) {
    this.esProyectoInscrito = true;
    this.isModalOpen = true;
    this.comentarios = [];
    this.nuevoComentario = '';
    this.modoEdicion = false;

    const sesion = this.authService.obtenerSesion();
    const usuarioId = sesion?.id ?? undefined;

    this.proyectoService.getProyectoById(p.id, usuarioId).subscribe({
      next: (fullProj) => {
        this.proyectoSeleccionado = { ...fullProj, alumnos: [] };
        this.proyectoService.getAlumnosPorProyecto(p.id).subscribe({
          next: (alumnosBackend: any[]) => {
            this.proyectoSeleccionado.alumnos = alumnosBackend;
          },
          error: (err) => {
            console.warn('[WARN] No se pudo cargar la lista de alumnos', err);
            this.proyectoSeleccionado.alumnos = [];
          }
        });
      },
      error: (err) => {
        console.error('Error fetching project by id', err);
        this.proyectoSeleccionado = { ...p, alumnos: [] };
      }
    });

    this.cargarComentarios(p.id);
  }

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
        this.presentToast(`✅ Rol de ${colaborador.nombreReal} actualizado a ${nuevoRol}`, 'success');
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al cambiar el rol';
        this.presentToast(`❌ ${msg}`, 'danger');
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
        this.presentToast('✅ Proyecto actualizado con éxito', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al actualizar el proyecto';
        this.presentToast(`❌ ${msg}`, 'danger');
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
        this.presentToast('🗑️ Proyecto eliminado con éxito', 'success');
        this.isModalOpen = false;
        this.ngOnInit();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar el proyecto';
        this.presentToast(`❌ ${msg}`, 'danger');
      }
    });
  }

  triggerInputImagenEdicion() {
    this.inputImagenEdicionRef?.nativeElement.click();
  }

  onImagenSeleccionadaEdicion(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.presentToast('La imagen no puede superar los 2 MB', 'warning');
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

  triggerInputDocumento() {
    this.inputDocumentoRef?.nativeElement.click();
  }

  onDocumentoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.proyectoSeleccionado) return;

    if (file.size > 5 * 1024 * 1024) {
      this.presentToast('El documento no puede superar los 5 MB', 'warning');
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
          this.presentToast('✅ Documento subido correctamente', 'success');
          this.recargarDetallesProyecto();
        },
        error: async (err) => {
          this.subiendoRecurso = false;
          const msg = err?.error?.message ?? 'Error al subir el documento';
          this.presentToast(`❌ ${msg}`, 'danger');
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
        this.presentToast('🗑️ Documento eliminado', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar el documento';
        this.presentToast(`❌ ${msg}`, 'danger');
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
      this.presentToast('La imagen no puede superar los 2 MB', 'warning');
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
          this.presentToast('✅ Imagen añadida a la galería', 'success');
          this.recargarDetallesProyecto();
        },
        error: async (err) => {
          this.subiendoRecurso = false;
          const msg = err?.error?.message ?? 'Error al subir la imagen';
          this.presentToast(`❌ ${msg}`, 'danger');
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
        this.presentToast('🗑️ Imagen eliminada de la galería', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar la imagen';
        this.presentToast(`❌ ${msg}`, 'danger');
      }
    });
  }

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

  agregarColaborador(event: Event) {
    const select = event.target as HTMLSelectElement;
    const colabUsuarioId = Number(select.value);
    if (!colabUsuarioId || !this.proyectoSeleccionado) return;

    this.proyectoService.inscribirse(colabUsuarioId, this.proyectoSeleccionado.id).subscribe({
      next: async () => {
        this.presentToast('✅ Colaborador añadido al proyecto', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al añadir colaborador';
        this.presentToast(`❌ ${msg}`, 'danger');
      }
    });
    select.value = '';
  }

  eliminarColaborador(colabUsuarioId: number) {
    if (!this.proyectoSeleccionado) return;
    this.proyectoService.salir(colabUsuarioId, this.proyectoSeleccionado.id).subscribe({
      next: async () => {
        this.presentToast('🗑️ Colaborador eliminado del proyecto', 'success');
        this.recargarDetallesProyecto();
      },
      error: async (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar colaborador';
        this.presentToast(`❌ ${msg}`, 'danger');
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
}
