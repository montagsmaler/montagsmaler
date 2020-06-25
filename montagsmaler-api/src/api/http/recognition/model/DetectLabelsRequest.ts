import { IsNotEmpty } from 'class-validator';
import { Rekognition } from 'aws-sdk';
import { S3Object } from './S3Object';
import { Image } from './Image';

export class DetectLabelsRequest implements Rekognition.DetectLabelsRequest {

    public Image: Image = new Image();

    public MaxLabels?: number;

    public MinConfidence?: number;

    constructor(Bucket?: string, Name?: string){
      this.Image.S3Object.Bucket = Bucket;
      this.Image.S3Object.Name = Name;
    }

}