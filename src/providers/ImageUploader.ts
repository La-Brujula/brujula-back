import { Request } from 'express';
import fs from 'fs';
import config from '@/config';
import crypto from 'crypto';
import Logger from './Logger';
import { UploadedFile } from 'express-fileupload';

class ImageUploader {
  private destination!: string;
  private imageServiceURL!: string;

  constructor() {
    this.destination = config.images.imagesPath;
    this.imageServiceURL = config.images.imagesBaseURL;
  }

  async saveImage(req: Request, imageAttribute: string) {
    if (req.files === null || req.files === undefined) return false;

    const file = req.files[imageAttribute];
    if (file === undefined) return false;

    const { mv, name } = file as UploadedFile;

    const hash = crypto.randomBytes(8).toString('hex');
    const ref = `${hash}-${name}`;
    const imagePath = `${this.destination}/${ref}`;

    mv(imagePath);

    Logger.debug(`Created file: ${imagePath}`);

    const link = `${this.imageServiceURL}/${ref}`;
    return { link, ref };
  }

  getFilePathFromImageId(imageId: string) {
    if (imageId[0] == '/' || imageId[0] == '.')
      throw Error('Suspicious activity');
    const path = `${this.destination}/${imageId}`;
    if (!fs.existsSync(path)) {
      return false;
    }
    return fs.realpathSync(path);
  }
}

export default new ImageUploader();
