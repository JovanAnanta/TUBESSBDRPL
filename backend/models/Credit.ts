import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "credit", timestamps: false
})
export class Credit extends Model {

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nomorRekeningAsal: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false
    })
    declare jumlahSaldoBertambah: number;
}
