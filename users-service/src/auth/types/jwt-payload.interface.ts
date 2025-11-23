export interface JwtPayload {
    idUser: number;
    name: string;
    email: string;
    userType: 'CUSTOMER' | 'COMPANY' | 'ADMIN';
}

export interface AuthenticatedUser {
    idUser: number;
    name: string;
    email: string;
    userType: 'CUSTOMER' | 'COMPANY' | 'ADMIN';
}