import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonModal, IonBadge, IonCardContent, IonSearchbar,
  IonItem, IonLabel, ToastController, IonList, IonInput, IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircle, closeOutline, exitOutline, timeOutline,
  logInOutline, logOutOutline, addCircleOutline, chatbubblesOutline,
  chatbubbleEllipsesOutline, send, statsChartOutline,
  listOutline, checkmarkDoneCircle, eyeOutline,
  peopleOutline, folderOpenOutline, searchOutline,
  calendarOutline, saveOutline
} from 'ionicons/icons';
import { HeaderComponent } from '../components/header/header.component';
import { proyecto } from '../modelos/proyecto';
import { ProyectoService } from '../services/proyecto-service';
import { AlumnoService } from '../services/alumno-service';
import { AuthService } from '../services/auth-service';
import { AsistenciaService } from '../services/asistencia-service';
import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

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
    IonItem, IonLabel, IonInput, IonList, IonSelect, IonSelectOption
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
  asistenciaHoy: any = null;

  // Horario del alumno para hoy
  horarioHoy: { horaInicio: string; horaFin: string } | null = null;
  franjaActiva: 'activa' | null = null;

  // Formulario para añadir horario cuando no tiene NINGUNO guardado
  mostrarFormHorario = false;
  guardandoHorario = false;
  alumnoIdReal: number | null = null;
  // Ya no necesita diaSemana: se guarda para todos los días laborables de golpe
  formHorario = { horaInicio: '', horaFin: '' };

  // Proyectos
  misProyectos: proyecto[] = [];
  nuevosProyectos: proyecto[] = [];

  misProyectosFiltrados: proyecto[] = [];
  nuevosProyectosFiltrados: proyecto[] = [];
  loadingProyectos = true;

  private toastController = inject(ToastController);
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);
  private alumnoService = inject(AlumnoService);
  private asistenciaService = inject(AsistenciaService);

  constructor() {
    addIcons({
      personCircle, closeOutline, exitOutline, timeOutline,
      logInOutline, logOutOutline, addCircleOutline, chatbubblesOutline,
      chatbubbleEllipsesOutline, send, statsChartOutline,
      listOutline, checkmarkDoneCircle, eyeOutline,
      peopleOutline, folderOpenOutline, searchOutline,
      calendarOutline, saveOutline
    });
  }

  ngOnInit() {
    this.authService.sesion$.subscribe(sesion => {
      this.nombreUsuario = sesion?.nombreReal ?? 'Usuario';
      this.mostrarTarjetaAsistencia = true;
    });
    this.cargarProyectos();
    this.cargarHorarioYFichaje();
  }

  // ─────────────────────────────────────────────────────────────
  // CARGA DE HORARIO Y FICHAJE
  // ─────────────────────────────────────────────────────────────
  cargarHorarioYFichaje() {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) return;

    const diasSemanaMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaHoy = diasSemanaMap[new Date().getDay()];
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    this.alumnoService.getAlumnoByUsuarioId(sesion.id).subscribe({
      next: (alumno: any) => {
        console.log('[DEBUG] Respuesta getAlumnoByUsuarioId:', JSON.stringify(alumno));

        const alumnoId: number = alumno.alumnoId ?? alumno.id;

        if (!alumnoId) {
          console.warn('[WARN] No se pudo determinar el alumnoId del usuario', sesion.id);
          this.mostrarTarjetaAsistencia = false;
          return;
        }

        this.alumnoIdReal = alumnoId;

        // Verificar si ya fichó hoy
        this.asistenciaService.haFichadoHoy(alumnoId).subscribe({
          next: (asistencia) => {
            this.asistenciaHoy = asistencia;
            this.mostrarTarjetaAsistencia = true;
            this.cargarHorarioParaAlumno(alumnoId, diaHoy, horaActual);
          },
          error: () => {
            this.asistenciaHoy = null;
            this.mostrarTarjetaAsistencia = true;
            this.cargarHorarioParaAlumno(alumnoId, diaHoy, horaActual);
          }
        });
      },
      error: async (err) => {
        console.warn('[WARN] getAlumnoByUsuarioId error:', err?.status, err?.message);
        this.mostrarTarjetaAsistencia = false;
      }
    });
  }

  cargarHorarioParaAlumno(alumnoId: number, diaHoy: string, horaActual: number) {
    this.alumnoService.getHorarioAlumno(alumnoId).subscribe({
      next: (horarios: any[]) => {
        const horariosHoy = horarios.filter((h: any) =>
          h.diaSemana?.toLowerCase() === diaHoy.toLowerCase()
        );

        if (horariosHoy.length === 0) {
          if (horarios.length > 0) {
            const ref = horarios[0];
            this.alumnoService.crearHorario({
              alumnoId: alumnoId,
              diaSemana: diaHoy,
              horaInicio: ref.horaInicio,
              horaFin: ref.horaFin
            }).subscribe({
              next: () => this.cargarHorarioYFichaje(),
              error: () => {
                this.horarioHoy = { horaInicio: ref.horaInicio, horaFin: ref.horaFin };
                this.franjaActiva = 'activa';
              }
            });
            return;
          }

          this.horarioHoy = null;
          this.franjaActiva = null;
          this.mostrarFormHorario = true;
          return;
        }

        this.mostrarFormHorario = false;
        horariosHoy.sort((a: any, b: any) => {
          const [aH, aM] = a.horaInicio.split(':').map(Number);
          const [bH, bM] = b.horaInicio.split(':').map(Number);
          return (aH * 60 + aM) - (bH * 60 + bM);
        });

        const activo = horariosHoy.find((h: any) => {
          const [hiH, hiM] = h.horaInicio.split(':').map(Number);
          const [hfH, hfM] = h.horaFin.split(':').map(Number);
          return horaActual >= (hiH * 60 + hiM) && horaActual <= (hfH * 60 + hfM);
        });

        if (activo) {
          this.horarioHoy = { horaInicio: activo.horaInicio, horaFin: activo.horaFin };
          this.franjaActiva = 'activa';
        } else {
          const proximo = horariosHoy[0];
          this.horarioHoy = { horaInicio: proximo.horaInicio, horaFin: proximo.horaFin };
          this.franjaActiva = null;
        }
      },
      error: () => {
        this.horarioHoy = { horaInicio: '08:00', horaFin: '15:00' };
        this.franjaActiva = 'activa';
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // GUARDAR HORARIO (primera vez — guarda lunes a viernes de golpe)
  // ─────────────────────────────────────────────────────────────
  async guardarHorario() {
    if (!this.alumnoIdReal || !this.formHorario.horaInicio || !this.formHorario.horaFin) {
      const toast = await this.toastController.create({
        message: 'Rellena la hora de entrada y salida',
        duration: 2000, color: 'warning', position: 'top'
      });
      await toast.present();
      return;
    }

    this.guardandoHorario = true;

    const diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const peticiones = diasLaborables.map(dia =>
      this.alumnoService.crearHorario({
        alumnoId: this.alumnoIdReal!,
        diaSemana: dia,
        horaInicio: this.formHorario.horaInicio,
        horaFin: this.formHorario.horaFin
      })
    );

    forkJoin(peticiones).subscribe({
      next: async () => {
        this.guardandoHorario = false;
        const toast = await this.toastController.create({
          message: '✅ Horario guardado para toda la semana',
          duration: 2000, color: 'success', position: 'top'
        });
        await toast.present();
        this.cargarHorarioYFichaje();
      },
      error: async () => {
        this.guardandoHorario = false;
        const toast = await this.toastController.create({
          message: '❌ Error al guardar el horario',
          duration: 2000, color: 'danger', position: 'top'
        });
        await toast.present();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // PROYECTOS
  // ─────────────────────────────────────────────────────────────
  cargarProyectos() {
    const sesion = this.authService.obtenerSesion();
    if (!sesion?.id) { this.loadingProyectos = false; return; }

    this.loadingProyectos = true;

    forkJoin({
      misProyectos: this.proyectoService.getProyectosActivos(sesion.id),
      nuevosProyectos: this.proyectoService.getProyectosDisponibles(sesion.id)
    }).subscribe({
      next: ({ misProyectos, nuevosProyectos }) => {
        this.misProyectos = misProyectos;
        this.nuevosProyectos = nuevosProyectos;
        this.misProyectosFiltrados = [...misProyectos];
        this.nuevosProyectosFiltrados = this.ordenarPorEstado(nuevosProyectos);
        this.loadingProyectos = false;
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Error al cargar los proyectos', duration: 2000,
          color: 'danger', position: 'top'
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
      this.nuevosProyectosFiltrados = this.ordenarPorEstado(this.nuevosProyectos);
      return;
    }
    this.misProyectosFiltrados = this.misProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) || p.descripcion?.toLowerCase().includes(texto)
    );
    this.nuevosProyectosFiltrados = this.ordenarPorEstado(this.nuevosProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) || p.descripcion?.toLowerCase().includes(texto)
    ));
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS DE PROYECTOS
  // ─────────────────────────────────────────────────────────────
  private ordenarPorEstado(proyectos: proyecto[]): proyecto[] {
    const prioridad: Record<string, number> = { 'en curso': 0, 'pausado': 1, 'finalizado': 2 };
    return [...proyectos].sort((a, b) =>
      (prioridad[a.estado] ?? 99) - (prioridad[b.estado] ?? 99)
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
    if (!this.alumnoIdReal) return;

    const sesion = this.authService.obtenerSesion();

    this.asistenciaService.fichar(this.alumnoIdReal).subscribe({
      next: async () => {
        const hoy = new Date().toISOString().split('T')[0];
        if (sesion?.id) {
          localStorage.setItem(`fechaFichaje_${sesion.id}`, hoy);
        }

        const toast = await this.toastController.create({
          message: '✅ Entrada registrada correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        this.cargarHorarioYFichaje();
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: '❌ Error al registrar la entrada',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async desfichar() {
    if (!this.alumnoIdReal) return;

    this.asistenciaService.ficharSalida(this.alumnoIdReal).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: '✅ Salida registrada correctamente. ¡Buen trabajo hoy! 🚀',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        this.cargarHorarioYFichaje();
      },
      error: async (err) => {
        const mensaje = err?.error?.message ?? 'Error al registrar la salida';
        const toast = await this.toastController.create({
          message: `❌ ${mensaje}`,
          duration: 2500,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // INSCRIBIRSE
  // ─────────────────────────────────────────────────────────────
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
    if (!sesion?.id) return;

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

  // ─────────────────────────────────────────────────────────────
  // MODAL Y COMENTARIOS
  // ─────────────────────────────────────────────────────────────
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
