import { AuthRole } from '../../auth/models/auth';
import { TokenPayLoad } from '../../auth/models/token';
import { Action } from './action';

export interface PolicyHandler {
  can(
    user: TokenPayLoad,
    action: Action,
    resourceId?: string,
  ): boolean | Promise<boolean>;
}
