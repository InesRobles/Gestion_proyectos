import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const sesion = auth.obtenerSesion();

  console.log('ROL EN SESIÓN:', sesion?.rol); // 👈 mira qué imprime exactamente


  if (sesion?.rol === 'administrador') {
    return true;
  }

  if (sesion) {
    return router.createUrlTree(['/home']);
  }



  return router.createUrlTree(['/login']);
};
