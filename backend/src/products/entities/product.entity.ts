import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommercialOffer } from '../../commercial-offers/entities/commercial-offer.entity';

@Entity('products')
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', nullable: true })
	number: number;

	@Column({ type: 'varchar', length: 500 })
	name: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	unit: string;

	@Column({ type: 'int' })
	quantity: number;

	@Column({ type: 'decimal', precision: 12, scale: 2 })
	price: number;

	@Column({ type: 'varchar', length: 255 })
	supplier: string;

	@ManyToOne(() => CommercialOffer, commercialOffer => commercialOffer.products, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'commercial_offer_id' })
	commercialOffer: CommercialOffer;

	@Column({ name: 'commercial_offer_id' })
	commercialOfferId: number;
}