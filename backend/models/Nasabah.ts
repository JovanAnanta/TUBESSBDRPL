import { Column, DataType, Model, Table, HasMany } from "sequelize-typescript";
import { Transaksi } from "./Transaksi";
import { LoginActivity } from "./LoginActivity";

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
        defaultValue: 'Aktif',
    })
    declare status: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare createdAt: Date;

    @HasMany(() => Transaksi)
    declare transaksi?: Transaksi[];

    @HasMany(() => LoginActivity)
    declare login_activities?: LoginActivity[];
}