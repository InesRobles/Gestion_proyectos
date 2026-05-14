import {Component, OnInit} from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {AuthService} from "./services/auth-service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
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
