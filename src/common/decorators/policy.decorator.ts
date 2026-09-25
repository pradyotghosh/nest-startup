import { SetMetadata, Type } from '@nestjs/common';

import { Action } from '../policies/action';
import { PolicyHandler } from '../policies/policy.interface';
import { AuthRole } from '../../auth/models/auth';

export const POLICY_KEY = 'policy';

export interface PolicyMetadata {
  policy: Type<PolicyHandler>;
  action: Action;
  resourceParam?: string;
  roles?: AuthRole[];
}

export const Policy = (
  policy: Type<PolicyHandler>,
  action: Action,
  resourceParam?: string,
  roles?: AuthRole[],
) =>
  SetMetadata(POLICY_KEY, {
    policy,
    action,
    resourceParam,
    roles,
  });
