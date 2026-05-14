import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonModal, IonBadge, IonCardContent, IonSearchbar,
  IonItem, IonLabel, ToastController, IonList, IonInput, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, closeOutline, exitOutline, timeOutline,
  logInOutline, addCircleOutline, chatbubblesOutline,
  chatbubbleEllipsesOutline, send, statsChartOutline,
  listOutline, checkmarkDoneCircle, eyeOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from "../components/header/header.component";
import {proyecto} from "../modelos/proyecto";
import {ProyectoService} from "../services/proyecto-service";
import { AuthService } from '../services/auth-service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonModal, IonBadge, IonCardContent, CommonModule,
    FormsModule, RouterLink, IonSearchbar, HeaderComponent,
    IonItem, IonLabel, IonInput, IonProgressBar, IonList
  ]
})
export class HomePage implements OnInit {

  isModalOpen = false;
  proyectoSeleccionado: any = null;
  esProyectoInscrito = false;
  nuevoComentario: string = '';

  // Lógica de Fichaje
  mostrarTarjetaAsistencia = true;
  isExiting = false;
  nombreUsuario = "";

  // Listas de proyectos desde BD
  misProyectos: proyecto[] = [];
  nuevosProyectos: proyecto[] = [];

  // Listas filtradas (las que se muestran)
  misProyectosFiltrados: proyecto[] = [];
  nuevosProyectosFiltrados: proyecto[] = [];

  loadingProyectos = true;

  // Imagen placeholder para cards sin imagen en BD
  readonly PLACEHOLDER_IMG = 'https://picsum.photos/seed/proyecto/600/400';

  constructor(
    private toastController: ToastController,
    private proyectoService: ProyectoService,
    private authService: AuthService,
  ) {
    addIcons({
      personCircle, closeOutline, exitOutline, timeOutline,
      logInOutline, addCircleOutline, chatbubblesOutline,
      chatbubbleEllipsesOutline, send, statsChartOutline,
      listOutline, checkmarkDoneCircle, eyeOutline
    });
  }

  ngOnInit() {
    const sesion = this.authService.obtenerSesion();
    this.nombreUsuario = sesion?.nombreReal ?? 'Usuario';

    const ultimoFichaje = localStorage.getItem('fechaFichaje');
    const hoy = new Date().toDateString();
    if (ultimoFichaje === hoy) {
      this.mostrarTarjetaAsistencia = false;
    }

    this.cargarProyectos();
  }

  cargarProyectos() {
    this.loadingProyectos = true;
    this.proyectoService.getProyectos().subscribe({
      next: (res) => {
        // Proyectos "en curso" son los del alumno activo
        this.misProyectos = res.filter(p => p.estado === 'en curso');
        // El resto (pausado, finalizado) van a "Explorar"
        this.nuevosProyectos = res.filter(p => p.estado !== 'en curso');
        this.misProyectosFiltrados = [...this.misProyectos];
        this.nuevosProyectosFiltrados = [...this.nuevosProyectos];
        this.loadingProyectos = false;
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Error al cargar los proyectos',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
        this.loadingProyectos = false;
      }
    });
  }

  buscarProyectos(textoBusqueda: string) {
    const texto = textoBusqueda ? textoBusqueda.toLowerCase().trim() : '';

    if (!texto) {
      this.misProyectosFiltrados = [...this.misProyectos];
      this.nuevosProyectosFiltrados = [...this.nuevosProyectos];
      return;
    }

    this.misProyectosFiltrados = this.misProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) ||
      p.descripcion?.toLowerCase().includes(texto)
    );

    this.nuevosProyectosFiltrados = this.nuevosProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) ||
      p.descripcion?.toLowerCase().includes(texto)
    );
  }

  // Devuelve la clase CSS para el chip de estado (sin espacios)
  getClaseEstado(estado: string): string {
    return 'estado-' + (estado ?? '').replace(/ /g, '-');
  }

  // Devuelve la imagen placeholder con seed único por proyecto para que cada card tenga una distinta
  getImagenProyecto(p: proyecto): string {
    return `https://picsum.photos/seed/${p.id}/600/400`;
  }

  // Traduce el estado del enum a una etiqueta legible
  getEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'en curso':   return 'En Curso';
      case 'finalizado': return 'Finalizado';
      case 'pausado':    return 'Pausado';
      default:           return estado;
    }
  }

  // Color del badge según estado
  getColorEstado(estado: string): string {
    switch (estado) {
      case 'en curso':   return 'success';
      case 'finalizado': return 'medium';
      case 'pausado':    return 'warning';
      default:           return 'primary';
    }
  }

  // --- ACCIONES ---
  async fichar() {
    const hoy = new Date().toDateString();
    localStorage.setItem('fechaFichaje', hoy);

    const toast = await this.toastController.create({
      message: '✅ Te has fichado correctamente',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();

    this.isExiting = true;
    setTimeout(() => this.mostrarTarjetaAsistencia = false, 500);
  }

  async inscribirse(proyecto: proyecto) {
    const toast = await this.toastController.create({
      message: `🚀 Inscripción enviada para: ${proyecto.titulo}`,
      duration: 2500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
  }

  verDetalles(p: proyecto, inscrito: boolean) {
    this.proyectoSeleccionado = p;
    this.esProyectoInscrito = inscrito;
    this.isModalOpen = true;
  }

  agregarComentario() {
    if (this.nuevoComentario.trim() && this.proyectoSeleccionado) {
      if (!this.proyectoSeleccionado.comentarios) {
        this.proyectoSeleccionado.comentarios = [];
      }
      this.proyectoSeleccionado.comentarios.push(this.nuevoComentario);
      this.nuevoComentario = '';
    }
  }
}
