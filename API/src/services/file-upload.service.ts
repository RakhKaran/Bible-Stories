import {
  BindingScope,
  config,
  ContextTags,
  injectable,
  Provider,
} from '@loopback/core';
import multer from 'multer';
import { FILE_UPLOAD_SERVICE } from '../keys';
import { FileUploadHandler } from '../types';
import slugify from 'slugify';

/**
 * A provider to return an `Express` request handler from `multer` middleware
 */
@injectable({
  scope: BindingScope.TRANSIENT,
  tags: { [ContextTags.KEY]: FILE_UPLOAD_SERVICE },
})
// export class FileUploadProvider implements Provider<FileUploadHandler> {
//   constructor(@config() private options: multer.Options = {}) {
//     if (!this.options.storage) {
//       // Default to disk storage with the filename containing a timestamp
//       this.options.storage = multer.diskStorage({
//         destination: this.options.dest || undefined, // Use dest instead of destination
//         filename: (req, file, cb) => {
//           const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
//           const fileName = `${timestamp}_${file.originalname}`;
//           cb(null, fileName);
//         },
//       });
//     }
//   }

//   value(): FileUploadHandler {
//     return multer(this.options).any();
//   }
// }

export class FileUploadProvider implements Provider<FileUploadHandler> {
  constructor(@config() private options: multer.Options = {}) {
    // if (!this.options.storage) {
    this.options.storage = multer.diskStorage({
      destination: this.options.dest || undefined,
      filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');

        // Slugify original name (without extension)
        const originalName = file.originalname;
        const dotIndex = originalName.lastIndexOf('.');
        const baseName =
          dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
        const ext =
          dotIndex !== -1 ? originalName.substring(dotIndex) : '';

        const slugifiedName = slugify(baseName, {
          lower: true,
          strict: true,
        });

        const fileName = `${timestamp}_${slugifiedName}${ext}`;
        cb(null, fileName);
      },
    });
    // }
  }

  value(): FileUploadHandler {
    return multer(this.options).any();
  }
}
