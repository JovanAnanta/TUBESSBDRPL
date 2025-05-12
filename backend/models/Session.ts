import { Table, Column, Model, DataType } from "sequelize-typescript";
import { v4 } from "uuid";

@Table({
    tableName: "session", timestamps: false
})

export class Session extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => v4(),
  })
  declare token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare exp_at: Date;
}