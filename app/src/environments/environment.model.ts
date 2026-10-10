export interface AppEnvironment {
  production: boolean;
  /**
   * Origin of the Spring Boot API. Empty means same origin: the SPA is served by the
   * backend in production and `ng serve` proxies `/api` to it in development.
   */
  apiUrl: string;
}
