import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Signed in (only activated accounts can obtain a session). */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady();
  if (!auth.user()) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return true;
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady();
  return auth.user() ? router.createUrlTree(['/dashboard']) : true;
};

/**
 * UI-level check only. Every `/api/admin/**` call is authorized by the backend (ROLE_ADMIN,
 * re-checked against the database on each request); this guard just keeps others out of the screens.
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady();
  return auth.isAdmin() ? true : router.createUrlTree(['/dashboard']);
};
