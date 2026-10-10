import { AppEnvironment } from './environment.model';

/** Production: the SPA is bundled into and served by the Spring Boot backend. */
export const environment: AppEnvironment = {
  production: true,
  apiUrl: '',
};
