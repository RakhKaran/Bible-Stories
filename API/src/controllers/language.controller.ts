import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { LanguageRepository } from "../repositories";
import { get, getJsonSchemaRef, getModelSchemaRef, param, patch, post, requestBody } from "@loopback/rest";
import { Language } from "../models";
import { BibleStoriesDataSource } from "../datasources";
import { inject } from "@loopback/core";

export class LanguageController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(LanguageRepository)
    public languageRepository : LanguageRepository
  ) {}

  // create language
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
      await this.languageRepository.create(languageData);
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
  @patch('/update-language/{languageId}')
  async updateLanguageById(
    @param.path.number('languageId') langId : number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Language, {partial: true}),
        },
      },
    })
    languageData: Language,
  ) : Promise<object> {
    try{
      const langData = await this.languageRepository.findById(langId);

      if(!langData){
        return{
          success : false,
          message : 'No language found for given id'
        }
      }

      await this.languageRepository.updateById(langData.id, languageData);

      return{
        success : true,
        message : 'Language Data updated'
      }
    }catch(error){
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
  @get('/fetch-language/{languageId}')
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