import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum TagihanType {
    AIR = "AIR",
    LISTRIK = "LISTRIK"
}

@Table({
    tableName: "tagihan",
    timestamps: false
})
export class Tagihan extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    })
    declare id: number;

    @Column({
    type: DataType.ENUM('AIR', 'LISTRIK'),
    allowNull: false
    })
    declare statusTagihanType: 'AIR' | 'LISTRIK';

    @Column({
        type: DataType.DOUBLE,
        allowNull: false
    })
    declare jumlahSaldoBerkurang: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nomorTagihan: string;
}