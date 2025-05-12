import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Nasabah } from "./Nasabah";

@Table({
    tableName: "report", timestamps: false
})
export class Report extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare report_id: string;

    @ForeignKey(() => Nasabah)
    @Column({
        type: DataType.UUID,
        allowNull: false
      })
    declare nasabah_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare deskripsi: string;

    @Column({
        type: DataType.ENUM("DIABAIKAN", "DIPROSES", "DITERIMA"),
        allowNull: false
    })
    declare status: string;
}
