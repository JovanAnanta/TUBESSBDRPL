import {
  Column,
  DataType, ForeignKey,
  HasOne,
  Model,
  Table,
  BelongsTo
} from "sequelize-typescript";
import { Credit } from "./Credit";
import { Debit } from "./Debit";
import { Nasabah } from "./Nasabah";
import { Pinjaman } from "./Pinjaman";
import { Tagihan } from "./Tagihan";
import { Transfer } from "./Transfer";

@Table({
  tableName: "transaksi", timestamps: false
})
export class Transaksi extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare transaksi_id: string;

  @ForeignKey(() => Nasabah)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare nasabah_id: string;

  @Column({
    type: DataType.ENUM("MASUK", "KELUAR"),
    allowNull: false
  })
  declare transaksiType: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare tanggalTransaksi: Date;

  @Column
({
    type: DataType.STRING,
    allowNull: false
  })
  declare keterangan: string;

  // Relasi ke child tables
  @HasOne(() => Debit)
  declare Debit?: Debit | null;

  @HasOne(() => Credit)
  declare Credit?: Credit | null;

  @HasOne(() => Transfer)
  declare Transfer?: Transfer | null;

  @HasOne(() => Tagihan)
  declare Tagihan?: Tagihan | null;

  @HasOne(() => Pinjaman)
  declare Pinjaman?: Pinjaman | null;

  @BelongsTo(() => Nasabah)
  nasabah!: Nasabah;
  
}
