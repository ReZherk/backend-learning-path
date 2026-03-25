import { Nota, User } from 'src/generated/prisma/client';
import { AuthUser } from '../interfaces/auth-user.interface';

export type NotaWithUser = Nota & { user: User };

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    nota?: NotaWithUser;
  }
}
