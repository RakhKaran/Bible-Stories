import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import multer from 'multer';
import path from 'path';
import {MySequence} from './sequence';
import {
  EmailManagerBindings,
  FILE_UPLOAD_SERVICE,
  STORAGE_DIRECTORY,
} from './keys';
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {JWTStrategy} from './authentication-strategy/jwt-strategy';
import {BcryptHasher} from './services/hash.password.bcrypt';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';
import {EmailService} from './services/email.service';
import { FirebaseAdmin } from './services/firebase.service';
import {SyncProductCron} from './services/cronjob.service';
import {ExcelImportService} from './services/excel-import.service';

export {ApplicationConfig};

export class BibleStoriesApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    //set up bindings
    this.setUpBinding();
    this.component(AuthenticationComponent);

    this.configureFileUpload(options.fileStorageDirectory);
    registerAuthenticationStrategy(this, JWTStrategy);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBinding(): void {
    this.bind('service.hasher').toClass(BcryptHasher);
    this.bind('service.jwt.service').toClass(JWTService);
    this.bind('service.excel.service').toClass(ExcelImportService);
    this.bind('service.user.service').toClass(MyUserService);
    this.bind('service.firebase-admin').toClass(FirebaseAdmin);
    this.bind(EmailManagerBindings.SEND_MAIL).toClass(EmailService);
    this.bind('service.cronjob.service').toClass(SyncProductCron);
  }

  protected configureFileUpload(destination?: string) {
    // Upload files to `dist/.sandbox` by default
    destination = destination ?? path.join(__dirname, '../.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);

    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        // Use the original file name with a timestamp prefix
        filename: (req, file, cb) => {
          const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
          const fileName = `${timestamp}_${file.originalname}`;
          cb(null, fileName);
        },
      }),
    };

    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
