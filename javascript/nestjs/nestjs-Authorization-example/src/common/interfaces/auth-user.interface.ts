import { Role } from '../enums/role.enum';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  teamId: string | null;
}
