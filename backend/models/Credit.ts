import { Table, Column, Model, DataType, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";

@Table({
    tableName: "credit", timestamps: false
})
export class Credit extends Model {

    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare credit_id: string;

    @ForeignKey(() => Transaksi)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    declare transaksi_id: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false
    })
    declare jumlahSaldoBertambah: number;


}
