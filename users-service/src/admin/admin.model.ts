import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

export enum UserType {
    ADMIN = 'ADMIN'
}

export interface AdminCreationAttributes {
    name: string;
    corporateReason: string;
    email: string;
    password: string;
    type: UserType;
}

@Table({ tableName: 'Admin', timestamps: false, modelName: 'Admin' })
export class Admin extends Model<Admin, AdminCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idAdmin: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare corporateReason: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare email: string;
    
    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare password: string;

    @Column({ 
        type: DataType.ENUM(...Object.values(UserType)),
        allowNull: false,
        defaultValue: UserType.ADMIN
    })
    declare type: UserType;

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
    
    static validatePasswordLevel(password: string) {
        const requirements = {
            hasACapitalLetter: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasANumber: /[0-9]/.test(password),
            thereIsSpecial: /[@#$%&*°?]/.test(password),
            minimumSize: password.length >= 8
        };

        const validate = Object.values(requirements).every(Boolean);
        return {
            validate,
            requirements,
            message: validate
                ? 'Valid password'
                : 'Password does not meet minimum requirements'
        };
    }
    
    @BeforeCreate
    static async hashPassword(instance: Admin) {
        const password = instance.getDataValue('password');
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            instance.setDataValue('password', hashedPassword);
        } else {
            console.error('Password undefined');
            throw new Error('Password is required');
        }
    }
}