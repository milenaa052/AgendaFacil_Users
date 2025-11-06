import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Company } from 'src/company/company.model';
import { Customer } from 'src/customer/customer.model';

@Table({ tableName: 'Favorites', timestamps: false, modelName: 'Favorites' })
export class Favorites extends Model<Favorites> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'idFavorites'
    })
    declare idFavorites: number;

    @ForeignKey(() => Customer)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false 
    })
    declare customerId: number;

    @ForeignKey(() => Company)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false 
    })
    declare companyId: number;

    @BelongsTo(() => Customer)
    declare customer: Customer;

    @BelongsTo(() => Company)
    declare company: Company;
}