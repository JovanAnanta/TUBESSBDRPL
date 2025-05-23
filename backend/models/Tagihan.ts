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
        type: DataType.ENUM({ values: Object.values(TagihanType) }),
        allowNull: false
    })
    declare statusTagihanType: TagihanType;

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
