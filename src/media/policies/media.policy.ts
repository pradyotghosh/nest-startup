import { Injectable } from '@nestjs/common';

import { Action } from '../../common/policies/action';
import { PolicyHandler } from '../../common/policies/policy.interface';
import { AuthRole } from '../../auth/models/auth';
import { TokenPayLoad } from '../../auth/models/token';
import { MediaRepository } from '../media.repository';

@Injectable()
export class MediaPolicy implements PolicyHandler {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async can(
    user: TokenPayLoad,
    action: Action,
    resourceId?: string,
  ): Promise<boolean> {
    if (user.role === AuthRole.ADMIN) {
      return true;
    }

    if (action === Action.CREATE && user.role === AuthRole.USER) {
      return true;
    }

    if (!resourceId) {
      return false;
    }

    const media = await this.mediaRepository.findById(Number(resourceId));

    return user.role === AuthRole.USER && media.uploadedById === user.sub;
  }
}
