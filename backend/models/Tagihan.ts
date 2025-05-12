import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "tagihan", timestamps: false
})
export class Tagihan extends Model {

    @Column({
        type: DataType.ENUM("AIR", "LISTRIK"),
        allowNull: false
    })
    declare statusTagihanType: string;

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
