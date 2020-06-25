import { Rekognition } from "aws-sdk";
import { S3Object } from "./S3Object";

export class Image implements Rekognition.Image {
    public S3Object: S3Object = new S3Object();
}