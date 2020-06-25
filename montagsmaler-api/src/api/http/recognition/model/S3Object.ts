import { Rekognition } from "aws-sdk";

export class S3Object implements Rekognition.S3Object {
	
	public Bucket: string;

    public Name: string;

    constructor(Bucket?: string, Name?: string){
        this.Name = Name
        this.Bucket = Bucket
    }
}