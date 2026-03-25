import { SetMetadata } from '@nestjs/common';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { AuthorizationService } from '../services/authorization.service';

export const CHECK_POLICY_KEY = 'check_policy';

export type PolicyHandler = (
  authz: AuthorizationService,
  user: AuthUser,
  recurso: unknown,
) => boolean;

export const CheckPolicy = (handler: PolicyHandler) =>
  SetMetadata(CHECK_POLICY_KEY, handler);
