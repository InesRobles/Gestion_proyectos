import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IonButtons, IonHeader, IonIcon, IonSearchbar, IonToolbar } from "@ionic/angular/standalone";
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { addIcons } from "ionicons";
import { arrowBackOutline, personCircle } from "ionicons/icons";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonHeader,
    IonIcon,
    IonSearchbar,
    IonToolbar,
    RouterLink,
    CommonModule
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() mostrarFlecha: boolean = true;
  @Output() search = new EventEmitter<string>();

  fotoUrl: string | null = null;
  nombreUsuario: string = 'Usuario Pro';

  private sesionSub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ arrowBackOutline, personCircle });
  }

  ngOnInit() {
    this.sesionSub = this.authService.sesion$.subscribe(sesion => {
      if (sesion) {
        this.nombreUsuario = sesion.nombreReal;
        this.fotoUrl = localStorage.getItem(`profile_foto_${sesion.id}`);
      } else {
        this.fotoUrl = null;
      }
    });
  }

  ngOnDestroy() {
    this.sesionSub?.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onSearch(event: any) {
    const searchTerm = event.detail.value || '';
    this.search.emit(searchTerm);
  }
}
