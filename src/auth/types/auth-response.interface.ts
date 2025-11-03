export interface LoginResponse {
    message: string;
    token: string;
    user: {
        idUser: number;
        name: string;
        email: string;
        userType: 'CUSTOMER' | 'COMPANY';
    };
}

export interface ProfileResponse {
    message: string;
    user: {
        idUser: number;
        name: string;
        email: string;
        userType: 'CUSTOMER' | 'COMPANY';
    };
}