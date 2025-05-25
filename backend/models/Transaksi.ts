import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Nasabah } from "./Nasabah";

@Table({
    tableName: "transaksi", timestamps: false
})
export class Transaksi extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare transaksi_id: string;

    @ForeignKey(() => Nasabah)
    @Column({
        type: DataType.UUID,
        allowNull: false
      })
    declare nasabah_id: string;

    @Column({
        type: DataType.ENUM("MASUK", "KELUAR"),
        allowNull: false
    })
    declare transaksiType: string;
    
    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare tanggalTransaksi: Date;
}
