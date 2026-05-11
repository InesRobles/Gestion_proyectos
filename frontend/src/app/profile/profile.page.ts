import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonList, IonItem, IonInput, IonModal, IonSearchbar,
  IonLabel, IonToggle, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, personOutline, closeOutline, schoolOutline, lockClosedOutline, exitOutline,
  timeOutline, shieldCheckmarkOutline, desktopOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { HeaderComponent } from "../components/header/header.component";

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
    IonLabel,
    IonToggle,
    IonSearchbar, HeaderComponent
  ]
})
export class ProfilePage implements OnInit {
  isPasswordModalOpen = false;
  fotoUrl: string | null = null;

  userData = {
    nombre_real: 'Usuario Pro',
    nombre_usuario: 'usuario_pro_2024',
    rol: 'alumno',
    modalidad: 'Desarrollo Fullstack'
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

  constructor(private navCtrl: NavController,
              private toastController: ToastController) {
    addIcons({
      personCircle, personOutline, closeOutline, lockClosedOutline, schoolOutline, exitOutline,
      timeOutline, shieldCheckmarkOutline, desktopOutline
    });
  }

  ngOnInit(): void {
    const savedFoto = localStorage.getItem('profile_foto');
    if (savedFoto) this.fotoUrl = savedFoto;

    const savedData = localStorage.getItem('profile_data');
    if (savedData) this.userData = JSON.parse(savedData);
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoUrl = e.target?.result as string;
        localStorage.setItem('profile_foto', this.fotoUrl!);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  abrirModalPassword() {
    this.isPasswordModalOpen = true;
  }

  // NUEVA FUNCIÓN PARA EL BOTÓN DE GUARDAR CAMBIOS
  async guardarCambios() {
    localStorage.setItem('profile_data', JSON.stringify(this.userData));
    if (this.fotoUrl) localStorage.setItem('profile_foto', this.fotoUrl);
    console.log('Nuevos datos del usuario:', this.userData);
    await this.presentToast('Cambios guardados correctamente', 'success');
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

    try {
      console.log('Enviando nueva contraseña...', { actual, nueva });
      await this.presentToast('Contraseña actualizada con éxito', 'success');
      this.isPasswordModalOpen = false;
      this.passwordData = { actual: '', nueva: '', confirmar: '' };
    } catch (error) {
      await this.presentToast('Error al actualizar la contraseña', 'danger');
    }
  }

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
