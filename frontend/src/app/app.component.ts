import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth-service';
import {AfkPopupComponent} from "./components/registro-actividad/registro-actividad.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AfkPopupComponent],
  standalone: true
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // ── Restaurar preferencia de modo oscuro ──
    const darkPref = localStorage.getItem('darkMode');
    if (darkPref === 'true') {
      document.body.classList.add('ion-palette-dark');
    } else if (darkPref === null) {
      // Sin preferencia guardada → respetar la del sistema
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('ion-palette-dark');
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const sesion = this.authService.obtenerSesion();
        if (!sesion) {
          window.location.href = '/login';
        }
      }
    });
  }
}
