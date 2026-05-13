import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardTitle, IonInput, IonItem,
  IonList, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonNote, IonRouterLink, IonLabel, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddSharp } from 'ionicons/icons';
import { RouterLink, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, IonCard,
    IonCardTitle, IonInput, IonList, IonItem,
    IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonNote, IonRouterLink, RouterLink, IonLabel,
    IonSelect, IonSelectOption, HttpClientModule
  ]
})
export class RegisterPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  nombreUsuario  = '';
  nombreReal     = '';
  contrasenaHash = '';
  confirmarPass  = '';

  mensajeError = '';
  mensajeExito = '';

  constructor() {
    addIcons({ personAddSharp });
  }

  onRegister() {
    if (!this.nombreUsuario || !this.nombreReal || !this.contrasenaHash) {
      this.mensajeError = 'Rellena todos los campos';
      return;
    }
    if (this.contrasenaHash !== this.confirmarPass) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.authService.register({
      nombreUsuario:  this.nombreUsuario,
      nombreReal:     this.nombreReal,
      contrasenaHash: this.contrasenaHash,
      rol:            'alumno'
    }).subscribe({
      next: () => {
        this.mensajeExito = '¡Cuenta creada correctamente!';
        this.mensajeError = '';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al registrar. Inténtalo de nuevo.';
      }
    });
  }
}
