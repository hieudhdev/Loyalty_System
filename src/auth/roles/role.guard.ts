import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    // Kiểm tra nếu user.roles tồn tại và là một mảng
    if (!user.role || !Array.isArray(user.role)) {
      return false;
    }

    // Kiểm tra xem có bất kỳ role nào trong requiredRoles xuất hiện trong user.roles
    return requiredRoles.some((role) => 
      user.role.includes(role) 
    );
  }
}