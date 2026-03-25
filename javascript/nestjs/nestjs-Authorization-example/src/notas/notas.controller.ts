import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotasService } from './notas.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CheckPolicy } from 'src/auth/decorators/check-policy.decorator';
import { AuthorizationService } from 'src/auth/services/authorization.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PoliciesGuard } from 'src/auth/guards/policies.guard';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { NotaWithUser } from 'src/common/types/express';

@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PoliciesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.LECTOR)
  @CheckPolicy(
    (authz: AuthorizationService, user: AuthUser, nota: NotaWithUser) =>
      authz.canViewNota(user, nota),
  )
  getNota(@Req() req: Request) {
    return this.notasService.mapNota(req.nota!);
  }
}
