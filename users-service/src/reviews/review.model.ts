import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Company } from 'src/company/company.model';
import { Customer } from 'src/customer/customer.model';

export enum ReviewStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface ReviewCreationAttributes {
    customerId: number;
    companyId: number;
    date: Date;
    rating: number;
    comment: string;
    status: ReviewStatus;
}

@Table({ tableName: 'Review', timestamps: false, modelName: 'Review' })
export class Review extends Model<Review, ReviewCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'idReview'
    })
    declare idReview: number;

    @ForeignKey(() => Customer)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false,
        field: 'customerId'
    })
    declare customerId: number;

    @ForeignKey(() => Company)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false,
        field: 'companyId'
    })
    declare companyId: number;

    @Column({ 
        type: DataType.DATE,
        allowNull: false 
    })
    declare date: Date;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false 
    })
    declare rating: number;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare comment: string;

    @Column({ 
        type: DataType.ENUM(...Object.values(ReviewStatus)),
        allowNull: false,
        defaultValue: ReviewStatus.ACTIVE
    })
    declare status: ReviewStatus;

    @BelongsTo(() => Customer)
    declare customer: Customer;
    
    @BelongsTo(() => Company)
    declare company: Company;
}