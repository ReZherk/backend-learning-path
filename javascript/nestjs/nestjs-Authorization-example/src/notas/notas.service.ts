import { Injectable } from '@nestjs/common';
import { NotaResponseDto } from './dto/nota-response.dto';
import { NotaWithUser } from 'src/common/types/express';

@Injectable()
export class NotasService {
  mapNota(nota: NotaWithUser): NotaResponseDto {
    return {
      id: nota.id,
      titulo: nota.titulo,
      contenido: nota.contenido,
      autorNombre: nota.user.name,
      teamId: nota.user.teamId,
      createdAt: nota.createdAt,
    };
  }
}
