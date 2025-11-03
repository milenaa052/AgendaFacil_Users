import { Request } from 'express';
import { AuthenticatedUser } from './jwt-payload.interface';

export interface AuthRequest extends Request {
    user: AuthenticatedUser;
}