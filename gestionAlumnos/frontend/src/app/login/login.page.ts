import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonCard, IonCardTitle, IonCol, IonContent,
  IonGrid, IonIcon, IonInput, IonItem, IonLabel,
  IonList, IonNote, IonRow, IonSelect, IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personSharp } from 'ionicons/icons';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, IonCard, IonCardTitle,
    IonInput, IonList, IonItem, IonButton, IonIcon, IonSelect,
    IonLabel, IonSelectOption, IonCol, IonGrid, IonRow, IonNote, RouterLink
  ]
})
export class LoginPage {

  nombreUsuario = '';
  contrasena = '';
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ personSharp });
  }

  iniciarSesion() {
    if (!this.nombreUsuario || !this.contrasena) {
      this.error = 'Por favor rellena todos los campos.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login({ nombreUsuario: this.nombreUsuario, contrasena: this.contrasena })
      .subscribe({
        next: (usuario) => {
          this.authService.guardarSesion(usuario);
          this.cargando = false;

          if (usuario.rol === 'administrador') {
            this.router.navigate(['/home-admin']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: () => {
          this.error = 'Usuario o contraseña incorrectos.';
          this.cargando = false;
        }
      });
  }
}
