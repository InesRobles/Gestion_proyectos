import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonList, IonItem, IonInput, IonModal, IonSearchbar,
  IonLabel, IonToggle, IonChip, NavController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, personOutline, closeOutline, schoolOutline, lockClosedOutline, exitOutline,
  timeOutline, shieldCheckmarkOutline, desktopOutline, addOutline, trashOutline, folderOpenOutline, briefcaseOutline, peopleOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from '../services/auth-service';
import { UsuarioService } from '../services/usuario-service';
import { CambioPasswordDTO } from '../services/usuario-service';
import { ModalidadService } from '../services/modalidad-service';
import { ProyectoService } from '../services/proyecto-service';
import { proyecto } from '../modelos/proyecto';
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
    IonLabel, IonToggle, IonSearchbar, IonChip, HeaderComponent
  ]
})
export class ProfilePage implements OnInit {

  isPasswordModalOpen = false;
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
  ) {
    addIcons({
      personCircle, personOutline, closeOutline, lockClosedOutline, schoolOutline, exitOutline,
      timeOutline, shieldCheckmarkOutline, desktopOutline, addOutline, trashOutline,  folderOpenOutline, briefcaseOutline, peopleOutline
    });
  }

  ngOnInit(): void {
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
        // Total de proyectos inscritos (para el contador del perfil)
        this.proyectoService.getProyectosPorAlumno(sesion.id).subscribe({
          next: (proyectos) => {
            this.numProyectos = proyectos.length;
          },
          error: () => {
            this.numProyectos = 0;
          }
        });

// Proyectos activos con cupos en tiempo real (va directo a la tabla de proyectos)
        this.proyectoService.getProyectosActivos(sesion.id).subscribe({
          next: (proyectos) => {
            this.proyectosActivos = proyectos;
          },
          error: () => {
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
        // Si el alumno tenía esa modalidad seleccionada, limpiarla
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

        if ((sesion.rol === 'alumno' || sesion.rol === 'administrador') && this.modalidadIdSeleccionada) {
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

  navegarAdmin() {
    this.navCtrl.navigateForward('/home-admin');
  }

  onModalidadChange(id: number | null): void {
    const encontrada = this.modalidades.find(m => m.id === id);
    if (encontrada) {
      this.userData.modalidad = encontrada.nombre;
    }
  }
}
