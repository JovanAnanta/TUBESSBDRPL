import {
  Table, Column, Model, DataType, ForeignKey,
  HasOne
} from "sequelize-typescript";
import { Nasabah } from "./Nasabah";
import { Debit } from "./Debit";
import { Credit } from "./Credit";
import { Transfer } from "./Transfer";
import { Tagihan } from "./Tagihan";
import { Pinjaman } from "./Pinjaman";

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

}
