import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IonButtons, IonHeader, IonIcon, IonSearchbar, IonToolbar } from "@ionic/angular/standalone";
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { addIcons } from "ionicons";
import { arrowBackOutline, personCircle } from "ionicons/icons";

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
export class HeaderComponent implements OnInit {
  @Input() mostrarFlecha: boolean = true;

  @Output() search = new EventEmitter<string>();

  fotoUrl: string | null = null;
  nombreUsuario: string = 'Usuario Pro';

  constructor() {
    addIcons({ arrowBackOutline, personCircle });
  }

  ngOnInit() {
    this.fotoUrl = localStorage.getItem('profile_foto');
    const savedData = localStorage.getItem('profile_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.nombre_real) this.nombreUsuario = data.nombre_real;
    }
  }

  onSearch(event: any) {
    const searchTerm = event.detail.value || '';
    this.search.emit(searchTerm);
  }
}
