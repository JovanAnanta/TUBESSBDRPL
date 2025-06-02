import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";

@Table({
    tableName: "debit", timestamps: false
})
export class Debit extends Model {

    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare debit_id: string;

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
    declare jumlahSaldoBerkurang: number;

    // ✅ Tambahkan relasi BelongsTo
    @BelongsTo(() => Transaksi)
    declare transaksi: Transaksi;
}
