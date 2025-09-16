import { User } from 'passport'; // oppure il tipo che usi per l'utente

declare global {
  namespace Express {
    interface Request {
      user?: User;
      logout?: (callback: (err: any) => void) => void;
      isAuthenticated?: () => boolean;
    }
  }
}
