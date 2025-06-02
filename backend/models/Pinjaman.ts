import { BelongsTo, Column, DataType, ForeignKey, Model, Table, HasMany } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";
import { TagihanPinjaman } from "./TagihanPinjaman";

@Table({
    tableName: "pinjaman", timestamps: false
})
export class Pinjaman extends Model {

    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
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
    declare jumlahPinjaman: number;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare tanggalJatuhTempo: Date;

    @Column({
        type: DataType.ENUM("ACCEPTED", "PENDING", "REJECTED"),
        allowNull: false
    })
    declare statusPinjaman: string;

    @BelongsTo(() => Transaksi)
    declare transaksi: Transaksi;

    // ✅ Tambahkan relasi ke TagihanPinjaman
    @HasMany(() => TagihanPinjaman)
    declare tagihan: TagihanPinjaman[];
}
