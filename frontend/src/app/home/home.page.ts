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
  // Estado del Modal y Selección
  isModalOpen = false;
  proyectoSeleccionado: any = null;
  esProyectoInscrito = false;
  nuevoComentario: string = '';

  // Lógica de Fichaje
  mostrarTarjetaAsistencia = true;
  isExiting = false;
  nombreUsuario = "Usuario Pro";

  // Listas de Proyectos (Base de datos local)
  misProyectos = [
    {
      titulo: 'Sistema de Gestión',
      categoria: 'Frontend',
      imagen: 'https://picsum.photos/id/10/600/400',
      descripcion: 'Un panel administrativo avanzado para gestionar usuarios y recursos en tiempo real.',
      progreso: 65,
      caracteristicas: ['Dashboard interactivo', 'Gestión de roles', 'Exportación a PDF'],
      comentarios: ['Maquetación terminada', 'Falta conectar API de usuarios']
    },
    {
      titulo: 'Pasarela de Pagos',
      categoria: 'Backend',
      imagen: 'https://picsum.photos/id/20/600/400',
      descripcion: 'Integración de seguridad de alto nivel para transacciones monetarias internacionales.',
      progreso: 40,
      caracteristicas: ['Certificación PCI-DSS', 'Soporte multi-moneda', 'Webhooks de respuesta'],
      comentarios: ['Iniciando pruebas de cifrado']
    }
  ];

  nuevosProyectos = [
    {
      titulo: 'AI Image Gen',
      categoria: 'Innovación',
      imagen: 'https://picsum.photos/id/30/600/400',
      descripcion: 'Generador de imágenes mediante inteligencia artificial basado en prompts.',
      progreso: 0,
      caracteristicas: ['Modelo Stable Diffusion', 'Interfaz optimizada', 'Cloud Storage'],
      comentarios: []
    },
    {
      titulo: 'Crypto Wallet',
      categoria: 'Web3',
      imagen: 'https://picsum.photos/id/50/600/400',
      descripcion: 'Billetera digital segura para el manejo de activos en la blockchain.',
      progreso: 0,
      caracteristicas: ['Seguridad biométrica', 'Soporte multichain', 'Swap integrado'],
      comentarios: []
    },
    {
      titulo: 'Medical Tracker',
      categoria: 'Salud',
      imagen: 'https://picsum.photos/id/60/600/400',
      descripcion: 'Diseño de interfaz para monitorización médica.',
      progreso: 0,
      caracteristicas: ['Gráficos en tiempo real', 'Alertas críticas', 'Historial médico'],
      comentarios: []
    }
  ];

  // Listas que se muestran (las que filtramos)
  misProyectosFiltrados: any[] = [];
  nuevosProyectosFiltrados: any[] = [];

  constructor(private toastController: ToastController) {
    addIcons({
      personCircle, closeOutline, exitOutline, timeOutline,
      logInOutline, addCircleOutline, chatbubblesOutline,
      chatbubbleEllipsesOutline, send, statsChartOutline,
      listOutline, checkmarkDoneCircle, eyeOutline
    });
  }

  ngOnInit() {
    // Inicializar listas filtradas
    this.misProyectosFiltrados = [...this.misProyectos];
    this.nuevosProyectosFiltrados = [...this.nuevosProyectos];

    // Verificar si ya fichó hoy
    const ultimoFichaje = localStorage.getItem('fechaFichaje');
    const hoy = new Date().toDateString();
    if (ultimoFichaje === hoy) {
      this.mostrarTarjetaAsistencia = false;
    }
  }

  // --- LÓGICA DE BÚSQUEDA CORREGIDA ---
  // Ahora recibe directamente el 'string' que le envía el header
  buscarProyectos(textoBusqueda: string) {
    // Aseguramos de que tengamos texto y lo pasamos a minúsculas
    const texto = textoBusqueda ? textoBusqueda.toLowerCase().trim() : '';

    if (!texto) {
      this.misProyectosFiltrados = [...this.misProyectos];
      this.nuevosProyectosFiltrados = [...this.nuevosProyectos];
      return;
    }

    this.misProyectosFiltrados = this.misProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto)
    );

    this.nuevosProyectosFiltrados = this.nuevosProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto)
    );
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

  async inscribirse(proyecto: any) {
    const toast = await this.toastController.create({
      message: `🚀 Inscripción enviada para: ${proyecto.titulo}`,
      duration: 2500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
  }

  verDetalles(p: any, i: boolean) {
    this.proyectoSeleccionado = p;
    this.esProyectoInscrito = i;
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
