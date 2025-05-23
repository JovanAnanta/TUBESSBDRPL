import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum NasabahStatus {
    Aktif = "Aktif",
    TidakAktif = "Tidak Aktif"
}

@Table({
    tableName: "nasabah",
    timestamps: false
})
export class Nasabah extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare nasabah_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare nama: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare noRekening: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare pin: string;

    @Column({
        type: DataType.DOUBLE,
        allowNull: false,
    })
    declare saldo: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare kodeAkses: string;

    @Column({
        type: DataType.ENUM('Aktif', 'Tidak Aktif'),
        allowNull: false,
        defaultValue: 'Tidak Aktif'
    })
    declare status: NasabahStatus;
}