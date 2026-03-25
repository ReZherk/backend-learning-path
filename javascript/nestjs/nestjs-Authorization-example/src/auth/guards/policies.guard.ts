import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../services/authorization.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CHECK_POLICY_KEY,
  PolicyHandler,
} from '../decorators/check-policy.decorator';

import { Request } from 'express';

export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authzService: AuthorizationService,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = this.reflector.get<PolicyHandler>(
      CHECK_POLICY_KEY,
      context.getHandler(),
    );

    if (!handler) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const currentUser = request.user;

    const notaId = request.params.id as string;

    const nota = await this.prisma.nota.findUnique({
      where: { id: notaId },
      include: {
        user: true,
      },
    });

    if (!nota) {
      throw new NotFoundException('Nota no encontrada');
    }

    const hasAccess = handler(this.authzService, currentUser!, nota);

    if (!hasAccess) {
      throw new ForbiddenException('No tienes permiso para ver esta nota');
    }

    request.nota = nota;

    return true;
  }
}
