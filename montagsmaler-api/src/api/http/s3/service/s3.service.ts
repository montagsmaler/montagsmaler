import { Injectable, Inject } from '@nestjs/common';
import { S3 } from 'aws-sdk'
import { S3PutObjectRequestDto } from '../model/S3PutObjectRequest.dto';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'

@Injectable()
export class S3Service {
    
	constructor(
		@Inject('S3_provider') private readonly s3: S3,
	) { }

	public upload(S3PutObjectRequest: S3PutObjectRequestDto): Promise<ManagedUpload.SendData> {
		return new Promise((resolve, reject) => {
			this.s3.upload(S3PutObjectRequest, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			})
		});
	}
}
