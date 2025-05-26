import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";

@Table({
    tableName: "tagihan",
    timestamps: false
})
export class Tagihan extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare tagihan_id: string;

    @ForeignKey(() => Transaksi)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    declare transaksi_id: string;

    @Column({
        type: DataType.ENUM("AIR", "LISTRIK"),
        allowNull: false,
    })
    declare statusTagihanType: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nomorTagihan: string;
    
    @BelongsTo(() => Transaksi)
    declare transaksi: Transaksi;
}
