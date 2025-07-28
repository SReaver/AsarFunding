import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('commercial_offers')
export class CommercialOffer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'date', name: 'offer_date' })
	offerDate: Date;

	@Column({ type: 'varchar', length: 255, name: 'object_name' })
	objectName: string;

	@Column({ type: 'int', name: 'validity_days', default: 3 })
	validityDays: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Column({ type: 'timestamp', name: 'expires_at' })
	expiresAt: Date;

	@OneToMany(() => Product, product => product.commercialOffer, { cascade: true })
	products: Product[];
}