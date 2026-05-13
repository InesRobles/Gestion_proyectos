import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonList, IonItem, IonInput, IonModal, IonSearchbar,
  IonLabel, IonToggle, NavController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, personOutline, closeOutline, schoolOutline, lockClosedOutline, exitOutline,
  timeOutline, shieldCheckmarkOutline, desktopOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from '../services/auth-service';
import { UsuarioService } from '../services/usuario-service';
import { CambioPasswordDTO } from '../services/usuario-service';

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
    IonLabel, IonToggle, IonSearchbar, HeaderComponent
  ]
})
export class ProfilePage implements OnInit {

  isPasswordModalOpen = false;
  fotoUrl: string | null = null;

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
  ) {
    addIcons({
      personCircle, personOutline, closeOutline, lockClosedOutline, schoolOutline, exitOutline,
      timeOutline, shieldCheckmarkOutline, desktopOutline
    });
  }

  ngOnInit(): void {
    const savedFoto = localStorage.getItem('profile_foto');
    if (savedFoto) this.fotoUrl = savedFoto;

    const sesion = this.authService.obtenerSesion();
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
          modalidad: usuario.modalidad ?? ''
        };
        if (!this.fotoUrl && (usuario as any).fotoUsuario) {
          this.fotoUrl = (usuario as any).fotoUsuario;
        }
      },
      error: () => {
        this.presentToast('No se pudieron cargar todos los datos del perfil', 'warning');
      }
    });
  }

  // ──────────────────────────────────────────────
  // FOTO — con compresión para evitar el límite de localStorage (5MB)
  // ──────────────────────────────────────────────

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    // Rechazar archivos demasiado grandes antes de procesar (>4MB)
    if (file.size > 4 * 1024 * 1024) {
      this.presentToast('La imagen es demasiado grande. Usa una imagen menor de 4MB.', 'warning');
      return;
    }

    this.comprimirImagen(file, 800, 0.75).then((base64Comprimida) => {
      this.fotoUrl = base64Comprimida;

      // Guardar en localStorage con control de errores
      try {
        localStorage.setItem('profile_foto', base64Comprimida);
      } catch (e) {
        console.warn('localStorage lleno, no se pudo guardar la foto localmente:', e);
        // Limpiar la foto anterior para liberar espacio e intentar de nuevo
        localStorage.removeItem('profile_foto');
        try {
          localStorage.setItem('profile_foto', base64Comprimida);
        } catch (e2) {
          console.warn('No se pudo guardar en localStorage ni tras limpiar:', e2);
        }
      }

      // Subir al backend
      const sesion = this.authService.obtenerSesion();
      if (sesion) {
        this.usuarioService.actualizarFoto(sesion.id, base64Comprimida).subscribe({
          next: () => this.presentToast('Foto actualizada correctamente', 'success'),
          error: (err) => {
            console.error('Error al subir foto al servidor:', err.status, err.error);
            this.presentToast('Foto guardada localmente (error al subir al servidor)', 'warning');
          }
        });
      }
    }).catch((err) => {
      console.error('Error al procesar la imagen:', err);
      this.presentToast('No se pudo procesar la imagen seleccionada', 'danger');
    });
  }

  /**
   * Comprime una imagen usando un canvas HTML.
   * @param file     Archivo de imagen original
   * @param maxSize  Ancho/alto máximo en píxeles (mantiene proporción)
   * @param quality  Calidad JPEG entre 0 y 1
   */
  private comprimirImagen(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.onload = () => {
          // Calcular nuevas dimensiones manteniendo la proporción
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

    const dto: CambioPasswordDTO = {
      contrasenaActual: actual,
      contrasenaNueva: nueva
    };

    this.usuarioService.actualizarPassword(sesion.id, dto).subscribe({
      next: async () => {
        await this.presentToast('Contraseña actualizada con éxito', 'success');
        this.isPasswordModalOpen = false;
        this.passwordData = { actual: '', nueva: '', confirmar: '' };
      },
      error: async (err) => {
        // Log completo para diagnosticar el 500 del backend
        console.error('Error al cambiar contraseña — Status:', err.status);
        console.error('Error al cambiar contraseña — Body:', err.error);
        console.error('Error al cambiar contraseña — DTO enviado:', dto);

        let mensaje = 'Error al actualizar la contraseña';
        if (err.status === 400) {
          mensaje = err?.error?.mensaje ?? 'La contraseña actual es incorrecta';
        } else if (err.status === 500) {
          mensaje = 'Error interno del servidor. Revisa los logs del backend.';
        }
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
}
