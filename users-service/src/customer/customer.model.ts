import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasOne } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

export enum UserType {
    CUSTOMER = 'CUSTOMER',
    COMPANY = 'COMPANY'
}

@Table({ tableName: 'Customer', timestamps: false, modelName: 'Customer' })
export class Customer extends Model<Customer> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'idCustomer'
    })
    declare idCustomer: number;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare name: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare cpf: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare phone: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare state: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare city: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare street: string;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false 
    })
    declare number: number;

    @Column({ 
        type: DataType.STRING,
        allowNull: true 
    })
    declare complement: string;

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
        allowNull: false 
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
    static async hashPassword(instance: Customer) {
        const password = instance.getDataValue('password');
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            instance.setDataValue('password', hashedPassword);
        } else {
            console.error('Password undefined');
            throw new Error('Password is required');
        }
    }

    @BeforeUpdate
    static async updatePassword(instance: Customer) {
        if (instance.changed('password')) {
            const newPassword = instance.getDataValue('password');
            
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                instance.setDataValue('password', hashedPassword);
            }
        }
    }
}