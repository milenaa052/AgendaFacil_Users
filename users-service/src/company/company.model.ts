import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasMany, AllowNull } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Favorites } from 'src/favorites/favorites.model';
import { Review } from 'src/reviews/review.model';

export enum UserType {
    CUSTOMER = 'CUSTOMER',
    COMPANY = 'COMPANY'
}

export interface CompanyCreationAttributes {
    name: string;
    corporateReason: string;
    cnpj: string;
    rayKm: number;
    phone: string;
    state: string;
    city: string;
    street: string;
    number: number;
    complement?: string;
    category: string;
    profession: string;
    averagePrice: number;
    email: string;
    password: string;
    type: UserType;
}

@Table({ tableName: 'Company', timestamps: false, modelName: 'Company' })
export class Company extends Model<Company, CompanyCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idCompany: number;

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
        allowNull: false,
    })
    declare cnpj: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare rayKm: number;

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
        allowNull: false,
    })
    declare category: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare profession: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare averagePrice: number;

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
        defaultValue: UserType.COMPANY 
    })
    declare type: UserType;

    @HasMany(() => Favorites)
    declare favorites: Favorites[];

    @HasMany(() => Review)
    declare reviews: Review[];

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
    static async hashPassword(instance: Company) {
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
    static async updatePassword(instance: Company) {
        if (instance.changed('password')) {
            const newPassword = instance.getDataValue('password');
            
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                instance.setDataValue('password', hashedPassword);
            }
        }
    }
}