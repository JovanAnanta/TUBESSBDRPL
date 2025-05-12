import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "debit", timestamps: false
})
export class Debit extends Model {

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nomorRekeningTujuan: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false
    })
    declare jumlahSaldoBerkurang: number;
}
