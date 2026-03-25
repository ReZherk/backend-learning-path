import { Injectable } from '@nestjs/common';
import { NotePolicy } from '../policies/note.policy';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { NotaWithUser } from 'src/common/types/express';

@Injectable()
export class AuthorizationService {
  constructor(private readonly notePolicy: NotePolicy) {}

  canViewNota(currentUser: AuthUser, nota: NotaWithUser) {
    return this.notePolicy.canView(currentUser, nota);
  }
}
