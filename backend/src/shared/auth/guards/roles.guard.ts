import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../database/entities/usuario.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Se não há roles especificadas, permite acesso
    }

    console.log(requiredRoles);

    const { user } = context.switchToHttp().getRequest();
    console.log(user);

    if (!user) {
      return false; // Se não há usuário autenticado, nega acesso
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
