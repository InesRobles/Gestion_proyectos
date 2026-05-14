import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonModal, IonBadge, IonCardContent,
  IonItem, IonLabel, ToastController, IonList, IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, closeOutline, exitOutline, timeOutline,
  logInOutline, addCircleOutline, chatbubblesOutline,
  chatbubbleEllipsesOutline, send, statsChartOutline,
  listOutline, checkmarkDoneCircle, eyeOutline,
  peopleOutline, folderOpenOutline, searchOutline
} from 'ionicons/icons';
import { HeaderComponent } from '../components/header/header.component';
import { proyecto } from '../modelos/proyecto';
import { ProyectoService } from '../services/proyecto-service';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonModal, IonBadge, IonCardContent, CommonModule,
    FormsModule, HeaderComponent,
    IonItem, IonLabel, IonInput, IonList
  ]
})
export class HomePage implements OnInit {

  isModalOpen = false;
  proyectoSeleccionado: any = null;
  esProyectoInscrito = false;
  nuevoComentario: string = '';

  mostrarTarjetaAsistencia = true;
  isExiting = false;
  nombreUsuario = '';

  misProyectos: proyecto[] = [];
  nuevosProyectos: proyecto[] = [];

  misProyectosFiltrados: proyecto[] = [];
  nuevosProyectosFiltrados: proyecto[] = [];

  loadingProyectos = true;

  private toastController = inject(ToastController);
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      personCircle, closeOutline, exitOutline, timeOutline,
      logInOutline, addCircleOutline, chatbubblesOutline,
      chatbubbleEllipsesOutline, send, statsChartOutline,
      listOutline, checkmarkDoneCircle, eyeOutline,
      peopleOutline, folderOpenOutline, searchOutline
    });
  }

  ngOnInit() {
    this.authService.sesion$.subscribe(sesion => {
      this.nombreUsuario = sesion?.nombreReal ?? 'Usuario';

      if (sesion?.id) {
        const ultimoFichaje = localStorage.getItem(`fechaFichaje_${sesion.id}`);
        const hoy = new Date().toDateString();
        this.mostrarTarjetaAsistencia = ultimoFichaje !== hoy;
      } else {
        this.mostrarTarjetaAsistencia = true;
      }
    });

    this.cargarProyectos();
  }

  cargarProyectos() {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) {
      this.loadingProyectos = false;
      return;
    }

    this.loadingProyectos = true;

    forkJoin({
      misProyectos: this.proyectoService.getProyectosActivos(sesion.id),
      nuevosProyectos: this.proyectoService.getProyectosDisponibles(sesion.id)
    }).subscribe({
      next: ({ misProyectos, nuevosProyectos }) => {
        this.misProyectos = misProyectos;
        this.nuevosProyectos = nuevosProyectos;
        this.misProyectosFiltrados = [...misProyectos];
        this.nuevosProyectosFiltrados = [...nuevosProyectos];
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

  getClaseEstado(estado: string): string {
    return 'estado-' + (estado ?? '').replace(/ /g, '-');
  }

  getImagenProyecto(p: proyecto): string {
    return `https://picsum.photos/seed/${p.id}/600/400`;
  }

  getEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'en curso':   return 'En Curso';
      case 'finalizado': return 'Finalizado';
      case 'pausado':    return 'Pausado';
      default:           return estado;
    }
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'en curso':   return 'success';
      case 'finalizado': return 'medium';
      case 'pausado':    return 'warning';
      default:           return 'primary';
    }
  }

  getPorcentajeCupo(p: proyecto): number {
    if (!p.cupoMaximo || p.cupoMaximo === 0) return 0;
    const ocupados = p.cupoMaximo - p.cuposDisponibles;
    return Math.min((ocupados / p.cupoMaximo) * 100, 100);
  }

  puedeInscribirse(p: proyecto): boolean {
    return p.estado === 'en curso' && p.cuposDisponibles > 0;
  }

  getTextoBotonInscripcion(p: proyecto): string {
    if (p.estado === 'finalizado') return 'Finalizado';
    if (p.estado === 'pausado')    return 'Pausado';
    if (p.cuposDisponibles <= 0)   return 'Sin cupos';
    return 'Inscribirse';
  }

  async fichar() {
    const sesion = this.authService.obtenerSesion();
    const hoy = new Date().toDateString();

    localStorage.setItem(`fechaFichaje_${sesion?.id}`, hoy);

    const toast = await this.toastController.create({
      message: '✅ Te has fichado correctamente',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();

    this.isExiting = true;
    setTimeout(() => (this.mostrarTarjetaAsistencia = false), 500);
  }

  async inscribirse(p: proyecto) {
    if (p.cuposDisponibles <= 0) {
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
        const toast = await this.toastController.create({
          message: `✅ Te has inscrito en "${p.titulo}" correctamente.`,
          duration: 2500,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
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

  async salirDeProyecto(p: proyecto) {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    this.proyectoService.salir(sesion.id, p.id).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: `✅ Has salido de "${p.titulo}" correctamente.`,
          duration: 2500,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        this.cargarProyectos();
      },
      error: async (err) => {
        const mensaje = err?.error?.mensaje ?? 'Error al salir del proyecto. Inténtalo de nuevo.';
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
}
