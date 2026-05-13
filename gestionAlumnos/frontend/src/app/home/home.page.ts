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
import { inject } from '@angular/core';

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


  private toastController = inject(ToastController);
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);
  constructor(){
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
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) {
      this.loadingProyectos = false;
      return;
    }

    this.loadingProyectos = true;
    
    // Hacemos ambas peticiones simultáneamente
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        activos: this.proyectoService.getProyectosActivosByAlumno(sesion.id),
        explorar: this.proyectoService.getProyectosExplorarByAlumno(sesion.id)
      }).subscribe({
        next: ({ activos, explorar }) => {
          this.misProyectos = activos;
          this.nuevosProyectos = explorar;
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

  async inscribirse(p: proyecto) {
    // Verificación local antes de llamar al backend
    if (p.cuposDisponibles !== undefined && p.cuposDisponibles <= 0) {
      const toast = await this.toastController.create({
        message: `❌ El proyecto "${p.titulo}" no tiene cupos disponibles.`,
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) {
      const toast = await this.toastController.create({
        message: 'No se pudo obtener tu sesión. Inicia sesión de nuevo.',
        duration: 3000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    this.proyectoService.inscribirse(sesion.id, p.id).subscribe({
      next: async () => {
        // Actualizar cupos disponibles localmente
        p.cuposDisponibles = (p.cuposDisponibles ?? 1) - 1;

        const toast = await this.toastController.create({
          message: `✅ Te has inscrito en "${p.titulo}" correctamente.`,
          duration: 2500,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();

        // Recargar proyectos para reflejar el estado actualizado
        this.cargarProyectos();
      },
      error: async (err) => {
        const mensaje = err?.error?.mensaje ?? 'Error al inscribirse. Inténtalo de nuevo.';
        const toast = await this.toastController.create({
          message: `❌ ${mensaje}`,
          duration: 3500,
          color: 'danger',
          position: 'bottom'
        });
        await toast.present();
      }
    });
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
