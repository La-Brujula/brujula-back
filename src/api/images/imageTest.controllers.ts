import ImageUploader from '@/providers/ImageUploader';
import { handleAsync } from '@/shared/utils/sendError';
import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export default class ImageTestControllers {
  public uploadImage = handleAsync(async (req: Request, res: Response) => {
    const imageSaveResult = await ImageUploader.saveImage(
      req,
      'image',
      req.user.ProfileId
    );
    if (imageSaveResult === false) throw Error('Could not process image');
    const { link, ref } = imageSaveResult;
    return res.status(202).json({ imageUrl: link, imageId: ref });
  });

  public getImage = handleAsync(async (req, res) => {
    const { imageId } = req.body;
    const imagePath = ImageUploader.getFilePathFromImageId(imageId);
    if (imagePath === false) throw Error('Could not get requested image');
    res.sendFile(imagePath);
  });
}
