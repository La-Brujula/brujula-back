import { IAccountDTO } from '@/models/authentication/authentication';


declare global {
  namespace Express {
    export interface Request {
      user: IAccountDTO;
    }
  }
}
