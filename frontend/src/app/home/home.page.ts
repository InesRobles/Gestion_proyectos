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
  logInOutline, addCircleOutline, chatbubblesOutline,
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
import {RouterLink} from "@angular/router";

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

  // Horario del alumno para hoy
  horarioHoy: { horaInicio: string; horaFin: string } | null = null;
  franjaActiva: 'activa' | null = null;

  // Formulario para añadir horario cuando no tiene
  mostrarFormHorario = false;
  guardandoHorario = false;
  alumnoIdReal: number | null = null;
  formHorario = { diaSemana: '', horaInicio: '', horaFin: '' };
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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
      logInOutline, addCircleOutline, chatbubblesOutline,
      chatbubbleEllipsesOutline, send, statsChartOutline,
      listOutline, checkmarkDoneCircle, eyeOutline,
      peopleOutline, folderOpenOutline, searchOutline,
      calendarOutline, saveOutline
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

        // ── FIX: el backend puede devolver el id del alumno en distintos
        //         campos según cómo esté mapeada la entidad.
        //         Probamos alumnoId primero (por si devuelve un DTO con ese campo)
        //         y si no existe usamos id (objeto alumno directo).
        //
        // 👉 Abre la consola del navegador y comprueba el log de abajo.
        //    Verás exactamente qué devuelve el backend y podrás ajustar si hace falta.
        console.log('[DEBUG] Respuesta getAlumnoByUsuarioId:', JSON.stringify(alumno));

        const alumnoId: number = alumno.alumnoId ?? alumno.id;

        if (!alumnoId) {
          // El backend devolvió algo pero sin id reconocible → no mostrar tarjeta
          console.warn('[WARN] No se pudo determinar el alumnoId del usuario', sesion.id);
          this.mostrarTarjetaAsistencia = false;
          return;
        }

        this.alumnoIdReal = alumnoId;
        this.formHorario.diaSemana = diaHoy;

        // Verificar si ya fichó hoy (404 del backend = no ha fichado aún)
        this.asistenciaService.haFichadoHoy(alumnoId).subscribe({
          next: () => {
            // Ya fichó hoy → ocultar tarjeta
            this.mostrarTarjetaAsistencia = false;
          },
          error: () => {
            // No ha fichado → cargar horario para ver si puede fichar
            this.alumnoService.getHorarioAlumno(alumnoId).subscribe({
              next: (horarios: any[]) => {
                const horariosHoy = horarios.filter((h: any) =>
                  h.diaSemana?.toLowerCase() === diaHoy.toLowerCase()
                );

                if (horariosHoy.length === 0) {
                  // Sin horario → mostrar formulario para añadirlo
                  this.horarioHoy = null;
                  this.franjaActiva = null;
                  this.mostrarFormHorario = true;
                  this.mostrarTarjetaAsistencia = true;
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
                this.mostrarTarjetaAsistencia = true;
              },
              error: () => {
                // Error cargando horario → valores por defecto para no bloquear al usuario
                this.horarioHoy = { horaInicio: '08:00', horaFin: '15:00' };
                this.franjaActiva = 'activa';
                this.mostrarTarjetaAsistencia = true;
              }
            });
          }
        });
      },
      error: async (err) => {
        // ── FIX usuario nuevo: si no tiene registro de alumno (404)
        //    ocultamos la tarjeta de asistencia en vez de mostrar error roto.
        //    Si el error es otro, mostramos un toast informativo.
        console.warn('[WARN] getAlumnoByUsuarioId error:', err?.status, err?.message);

        if (err?.status === 404) {
          // Usuario sin perfil de alumno → no mostrar sección de fichaje
          this.mostrarTarjetaAsistencia = false;
        } else {
          // Error de red u otro → tampoco mostramos la tarjeta rota
          this.mostrarTarjetaAsistencia = false;
          const toast = await this.toastController.create({
            message: 'No se pudo cargar el perfil de alumno',
            duration: 2500, color: 'warning', position: 'top'
          });
          await toast.present();
        }
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // GUARDAR HORARIO
  // ─────────────────────────────────────────────────────────────
  async guardarHorario() {
    if (!this.alumnoIdReal || !this.formHorario.diaSemana ||
      !this.formHorario.horaInicio || !this.formHorario.horaFin) {
      const toast = await this.toastController.create({
        message: 'Rellena todos los campos del horario',
        duration: 2000, color: 'warning', position: 'top'
      });
      await toast.present();
      return;
    }

    this.guardandoHorario = true;

    const payload = {
      alumnoId: this.alumnoIdReal,
      diaSemana: this.formHorario.diaSemana,
      horaInicio: this.formHorario.horaInicio,
      horaFin: this.formHorario.horaFin
    };

    this.alumnoService.crearHorario(payload).subscribe({
      next: async () => {
        this.guardandoHorario = false;
        const toast = await this.toastController.create({
          message: '✅ Horario guardado correctamente',
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
        this.nuevosProyectosFiltrados = [...nuevosProyectos];
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
      this.nuevosProyectosFiltrados = [...this.nuevosProyectos];
      return;
    }
    this.misProyectosFiltrados = this.misProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) || p.descripcion?.toLowerCase().includes(texto)
    );
    this.nuevosProyectosFiltrados = this.nuevosProyectos.filter(p =>
      p.titulo.toLowerCase().includes(texto) || p.descripcion?.toLowerCase().includes(texto)
    );
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS DE PROYECTOS
  // ─────────────────────────────────────────────────────────────
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

    // Obtenemos la sesión para el localStorage
    const sesion = this.authService.obtenerSesion();

    this.asistenciaService.fichar(this.alumnoIdReal).subscribe({
      next: async () => {
        const hoy = new Date().toISOString().split('T')[0];
        if (sesion?.id) {
          localStorage.setItem(`fechaFichaje_${sesion.id}`, hoy);
        }

        const toast = await this.toastController.create({
          message: '✅ Te has fichado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        this.isExiting = true;
        setTimeout(() => (this.mostrarTarjetaAsistencia = false), 500);
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: '❌ Error al registrar el fichaje',
          duration: 2000,
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
