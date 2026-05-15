import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { UsuarioService } from '../services/usuario-service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuarioService = inject(UsuarioService);
  const sesion = auth.obtenerSesion();

  if (!sesion) {
    return router.createUrlTree(['/login']);
  }

  return usuarioService.getUsuarioById(sesion.id).pipe(
    map((usuario) => {
      // Sincronizar la sesión local con el rol real de la BD
      if (usuario.rol !== sesion.rol) {
        auth.guardarSesion({ ...sesion, rol: usuario.rol });
      }

      if (usuario.rol === 'administrador') {
        return true;
      }
      return router.createUrlTree(['/home']);
    }),
    catchError(() => {
      if (sesion.rol === 'administrador') return of(true);
      return of(router.createUrlTree(['/home']));
    })
  );
};
