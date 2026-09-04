import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const token = req?.cookies?.['access_token'];

          console.log('COOKIE TOKEN EXISTS:', !!token);

          return token ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('JWT PAYLOAD:', payload);

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    console.log('USER FOUND:', !!user);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}