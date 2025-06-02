import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Pinjaman } from "./Pinjaman";

@Table({
  tableName: "tagihan_pinjaman",
  timestamps: false
})
export class TagihanPinjaman extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare tagihan_id: string;

  @ForeignKey(() => Pinjaman)
  @Column({ type: DataType.UUID, allowNull: false })
  declare pinjaman_id: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare tanggalTagihan: Date;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  declare jumlahTagihan: number;

  @Column({ type: DataType.ENUM("BELUM_BAYAR", "LUNAS"), defaultValue: "BELUM_BAYAR" })
  declare status: "BELUM_BAYAR" | "LUNAS";

  // ✅ Tambahkan relasi ke Pinjaman
  @BelongsTo(() => Pinjaman)
  declare pinjaman: Pinjaman;
}
