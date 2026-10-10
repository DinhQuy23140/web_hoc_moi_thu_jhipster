import { AppEnvironment } from './environment.model';

/** Local development: `ng serve` proxies `/api` to the backend on :8080 (proxy.conf.json). */
export const environment: AppEnvironment = {
  production: false,
  apiUrl: '',
};
