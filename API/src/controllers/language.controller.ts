import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { LanguageRepository } from "../repositories";
import { get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, param, patch, post, requestBody } from "@loopback/rest";
import { Language } from "../models";
import { BibleStoriesDataSource } from "../datasources";
import { inject } from "@loopback/core";
import { authenticate } from "@loopback/authentication";
import { PermissionKeys } from "../authorization/permission-keys";

export class LanguageController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(LanguageRepository)
    public languageRepository : LanguageRepository
  ) {}

  // create language
  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @post('/create-language', {
    responses: {
      '200': {
        description: 'Language',
        content: {
          schema: getJsonSchemaRef(Language),
        },
      },
    },
  })
  async createLanguage(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Language, {
            exclude: ['id'],
          }),
        },
      },
    })
    languageData: Omit<Language, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(Language, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try{
      await this.languageRepository.create(languageData,{
        transaction: tx,
      });
      await tx.commit();
      return{
        success : true,
        message : 'New Language Created'
      }
    }catch(error){
      await tx.rollback();
      throw error;
    }
  }

  // update language
  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.ADMIN]},
  })
  @patch('/update-language/{languageId}')
  async updateLanguageById(
    @param.path.number('languageId') langId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Language, {partial: true}),
        },
      },
    })
    languageData: Language,
  ): Promise<object> {
    try {
      const langData = await this.languageRepository.findById(langId);

      if (!langData) {
        return {
          success: false,
          message: 'No language found for the given id',
        };
      }

      // Check if another language with the same langName, nativeLangName, or code already exists (except the current one)
      const duplicateLanguage = await this.languageRepository.findOne({
        where: {
          and: [
            {id: {neq: langId}}, // Exclude the current language from the check
            {
              or: [
                { langName: languageData.langName },
                { nativeLangName: languageData.nativeLangName },
                { code: languageData.code },
              ],
            },
          ],
        },
      });

      if (duplicateLanguage) {
        throw new HttpErrors.BadRequest('A language with the same name, native name, or code already exists.');
      }

      await this.languageRepository.updateById(langId, languageData);
      return {
        success: true,
        message: 'Language Data updated',
      };
    } catch (error) {
      throw error;
    }
  }

  // fetch Languages
  @get('/fetch-languages')
  async fetchLanguages(
  ) : Promise<object>{
    try{
      const languages = await this.languageRepository.find();

      if(!languages){
        return{
          success : 'false',
          message : 'Languages Not Found'
        }
      }
      
      return{
        success : 'true',
        messgae : 'Languages Data',
        data : languages
      }
    }catch(error){
      throw error;
    }
  }

  // fetch language by id
  @get('/fetch-languages/{languageId}')
  async fetchLanguageById(
    @param.path.number('languageId') langId : number
  ) : Promise<object>{
    try{
      const language = await this.languageRepository.findById(langId);

      if(!language){
        return{
          success : 'false',
          message : 'No language found for given id'
        }
      }

      return{
        success : true,
        message : 'Language Data',
        data : language
      }
    }catch(error){
      throw error;
    }
  }

}