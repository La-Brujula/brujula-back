import { Request } from 'express';
import fs from 'fs';
import config from '@/config';
import Logger from './Logger';
import { UploadedFile } from 'express-fileupload';

class ImageUploader {
  private destination!: string;
  private imageServiceURL!: string;

  constructor() {
    this.destination = config.images.imagesPath;
    this.imageServiceURL = config.images.imagesBaseURL;
  }

  async saveImage(req: Request, imageAttribute: string, fileName: string) {
    if (req.files === null || req.files === undefined) return false;

    const file = req.files[imageAttribute];
    if (file === undefined) return false;

    const { mv, mimetype } = file as UploadedFile;
    const [type, ext] = mimetype.split('/');
    if (type !== 'image') throw Error('Wrong mimetype on file');
    fileName = fileName + `.${ext}`;
    const imagePath = `${this.destination}/${fileName}`;

    mv(imagePath);
    Logger.verbose(`Created file: ${imagePath}`);

    const link = `${this.imageServiceURL}/${fileName}`;
    return { link, ref: fileName };
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
