import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPaylod {
  sub: string; //userId
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPaylod): Promise<AuthUser> {
    const account = await this.prisma.account.findUnique({
      where: { email: payload.email },
      include: { user: true },
    });

    if (!account || !account.user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return {
      id: account.user.id,
      email: account.email,
      role: account.role,
      name: account.user.name,
      teamId: account.user.teamId,
    };
  }
}
