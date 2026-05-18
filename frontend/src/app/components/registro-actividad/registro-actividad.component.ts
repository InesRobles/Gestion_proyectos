import {
  Component, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { handRightOutline, checkmarkCircleOutline } from 'ionicons/icons';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { AuthService } from '../../services/auth-service';
import { RegistroActividadService } from '../../services/registro-actividad-service';

// ── Configuración ────────────────────────────────────────────
const MIN_INTERVALO_MIN = 120;  // 2 horas
const MAX_INTERVALO_MIN = 120;
const SEGUNDOS_RESPUESTA = 30;
const CIRCUNFERENCIA = 2 * Math.PI * 24;

@Component({
  selector: 'app-afk-popup',
  templateUrl: './registro-actividad.component.html',
  styleUrls: ['./registro-actividad.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(40px) scale(0.95)', opacity: 0 }),
        animate('250ms cubic-bezier(.34,1.56,.64,1)',
          style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in',
          style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class AfkPopupComponent implements OnInit, OnDestroy {

  visible = false;
  segundosRestantes = SEGUNDOS_RESPUESTA;
  dashOffset = 0;

  private popupTimer: any;
  private countdownTimer: any;
  private horaDisparo: string = '';

  constructor(
    private authService: AuthService,
    private registroService: RegistroActividadService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ handRightOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    // ✅ Solo la suscripción — si sesion$ es BehaviorSubject ya emite
    //    el valor actual al suscribirse, evitando la doble llamada
    this.authService.sesion$.subscribe(sesion => {
      if (sesion) {
        this.programarSiguientePopup();
      } else {
        this.limpiarTimers();
      }
    });
  }

  ngOnDestroy() {
    this.limpiarTimers();
  }

  private programarSiguientePopup() {
    this.limpiarTimers();
    const minutos = MIN_INTERVALO_MIN + Math.random() * (MAX_INTERVALO_MIN - MIN_INTERVALO_MIN);
    this.popupTimer = setTimeout(() => this.mostrarPopup(), minutos * 60 * 1000);
  }

  private mostrarPopup() {
    const sesion = this.authService.obtenerSesion();
    if (!sesion) return;

    // ✅ ISO siempre produce HH:mm:ss sin dependencias de locale ni navegador
    this.horaDisparo = new Date().toISOString().slice(11, 19);

    this.segundosRestantes = SEGUNDOS_RESPUESTA;
    this.dashOffset = 0;
    this.visible = true;
    this.cdr.detectChanges();

    this.countdownTimer = setInterval(() => {
      this.segundosRestantes--;
      this.dashOffset = CIRCUNFERENCIA * (1 - this.segundosRestantes / SEGUNDOS_RESPUESTA);

      if (this.segundosRestantes <= 0) {
        clearInterval(this.countdownTimer);
        this.registrarRespuesta(sesion.id, false);
        this.visible = false;
        this.cdr.detectChanges();
        this.programarSiguientePopup();
      }
    }, 1000);
  }

  responder() {
    clearInterval(this.countdownTimer);
    const sesion = this.authService.obtenerSesion();
    if (sesion) {
      this.registrarRespuesta(sesion.id, true);
    }
    this.visible = false;
    this.programarSiguientePopup();
  }

  private registrarRespuesta(usuarioId: number, respondido: boolean) {
    const payload = { usuarioId, hora: this.horaDisparo, respondido };
    console.log('[AfkPopup] Enviando:', payload); // quita esta línea cuando funcione
    this.registroService.registrar(payload).subscribe({
      error: (err) => console.error('[AfkPopup] Error al registrar:', err)
    });
  }

  get progress(): number {
    return this.segundosRestantes / SEGUNDOS_RESPUESTA;
  }

  private limpiarTimers() {
    clearTimeout(this.popupTimer);
    clearInterval(this.countdownTimer);
    this.visible = false;
  }
}
