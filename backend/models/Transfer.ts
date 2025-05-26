import { Table, Column, Model, DataType, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";

@Table({
    tableName: "transfer",
    timestamps: false
})
export class Transfer extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare transfer_id: string;

    @ForeignKey(() => Transaksi)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    declare transaksi_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare fromRekening: string;

    // akun penerima
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare toRekening: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare berita: string;
}
