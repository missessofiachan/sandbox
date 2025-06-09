import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class OrderSQLite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  products!: string; // JSON string of product IDs

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ default: 'pending' })
  status!: 'pending' | 'completed' | 'cancelled' | 'shipped' | 'delivered';

  @Column({ nullable: true })
  customerName?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default OrderSQLite;
