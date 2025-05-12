import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "admin", timestamps: false
})
export class Admin extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare admin_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare nama: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;
}
