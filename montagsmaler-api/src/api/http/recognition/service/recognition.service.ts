import { Injectable } from '@nestjs/common';
import  *  as AWS from 'aws-sdk'
import { S3Para } from '../model/S3Para.dto';
import { S3Object } from '../model/S3Object';
import { DetectLabelsRequest } from '../model/DetectLabelsRequest';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecognitionService {

    constructor(
        private configService: ConfigService
    ){}

    public rekognition(S3Para: S3Para): Promise<AWS.Rekognition.DetectLabelsResponse> {
        
        const rekognition = new AWS.Rekognition()

        const params = new DetectLabelsRequest(S3Para.Bucket, S3Para.Name)
        
		return new Promise((resolve, reject) => {
            
            rekognition.detectLabels(params, (err, data)=> {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(data)
                }
            })
        });
    }
}
