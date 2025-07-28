import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UploadStatus {
	SUCCESS = 'success',
	ERROR = 'error',
}

@Entity('upload_logs')
export class UploadLog {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn({ name: 'upload_date' })
	uploadDate: Date;

	@Column({ type: 'varchar', length: 255 })
	filename: string;

	@Column({ type: 'int', name: 'records_count' })
	recordsCount: number;

	@Column({
		type: 'varchar',
		length: 20,
		enum: UploadStatus,
	})
	status: UploadStatus;

	@Column({ type: 'text', nullable: true, name: 'error_message' })
	errorMessage: string;
}