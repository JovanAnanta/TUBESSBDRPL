import { Table, Column, Model, DataType, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";

@Table({
    tableName: "pinjaman", timestamps: false
})
export class Pinjaman extends Model {

    @Column({ primaryKey: true, type: DataType.UUID })
    declare pinjaman_id: string;

    @ForeignKey(() => Transaksi)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    declare transaksi_id: string;

    @Column({
        type: DataType.ENUM("6BULAN", "12BULAN", "24BULAN"),
        allowNull: false
    })
    declare statusJatuhTempo: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false
    })
    declare jumlahPerBulan: number;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare tanggalJatuhTempo: Date;

}
