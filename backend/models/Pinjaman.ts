import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "pinjaman", timestamps: false
})
export class Pinjaman extends Model {

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
        type: DataType.DOUBLE,
        allowNull: false
    })
    declare jumlahSaldoBerkurang: number;
    
    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare tanggalJatuhTempo: Date;


}
