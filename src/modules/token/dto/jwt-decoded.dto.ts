import { Role } from 'src/modules/user/schemas/role.schema';

export class JWTDecodeDto {
  iat: number;
  'sub': string;
  'email': string;
  'roles': Role[];
  'exp': number;
}
