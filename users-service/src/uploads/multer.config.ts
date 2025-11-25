import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export const multerOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (
      req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const userType = req?.user?.userType
        ? String(req.user.userType).toLowerCase()
        : 'user';
      const id = req?.user?.idUser ? req.user.idUser : 'anon';
      const timestamp = Date.now();
      const unique = uuidv4();
      const fileExt = extname(file.originalname);
      const filename = `${userType}-${id}-${timestamp}-${unique}${fileExt}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    const allowed = /jpeg|jpg|png/;
    const mimetype = file.mimetype;
    if (allowed.test(mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only jpg, jpeg and png are allowed.'),
        false,
      );
    }
  },
};

export default multerOptions;
