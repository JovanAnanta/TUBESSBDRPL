import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey } from "sequelize-typescript";
import { Nasabah } from "./Nasabah";

@Table({
  tableName: "login_activity",
  timestamps: false,
})
export class LoginActivity extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare login_id: string;

  @ForeignKey(() => Nasabah)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nasabah_id: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare waktu_login: Date;

  @Column({ type: DataType.STRING })
  declare location: string;

  @Column({ type: DataType.STRING })
  declare device_info: string;

  @Column({
    type: DataType.ENUM("SUCCESS", "FAILED"),
    allowNull: false,
  })
  declare status: string;
}
