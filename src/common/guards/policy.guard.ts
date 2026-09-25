import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

import { POLICY_KEY, PolicyMetadata } from '../decorators/policy.decorator';

import { PolicyHandler } from '../policies/policy.interface';
import { AuthRole } from '../../auth/models/auth';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<PolicyMetadata>(
      POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }
    if (metadata.roles && !metadata.roles.includes(user.role)) {
      throw new ForbiddenException();
    }
    const policy = this.moduleRef.get<PolicyHandler>(metadata.policy, {
      strict: false,
    });

    const resourceId = metadata.resourceParam
      ? request.params[metadata.resourceParam]
      : undefined;

    const allowed = await policy.can(user, metadata.action, resourceId);

    if (!allowed) {
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }

    return true;
  }
}
