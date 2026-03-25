import { Injectable } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { NotaWithUser } from 'src/common/types/express';

@Injectable()
export class NotePolicy {
  canView(currentUser: AuthUser, nota: NotaWithUser): boolean {
    const isAdmin = currentUser.role === Role.ADMIN;

    const isEditor = currentUser.role === Role.EDITOR;
    const isSameTeam = currentUser.teamId === nota.user.teamId;

    const isOwner = currentUser.id === nota.userId;

    return isAdmin || (isEditor && isSameTeam) || isOwner;
  }
}
