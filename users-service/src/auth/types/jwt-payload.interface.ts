export interface JwtPayload {
    idUser: number;
    name: string;
    email: string;
    userType: 'CUSTOMER' | 'COMPANY';
}

export interface AuthenticatedUser {
    idUser: number;
    name: string;
    email: string;
    userType: 'CUSTOMER' | 'COMPANY';
}