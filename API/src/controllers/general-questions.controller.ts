import { DefaultTransactionalRepository, IsolationLevel, repository } from "@loopback/repository";
import { GeneralQuestionsRepository, StoriesQuestionsRepository, UsersRepository } from "../repositories";
import { get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, param, patch, post, Request, requestBody, response, RestBindings } from "@loopback/rest";
import { GeneralQuestions, Stories, StoriesQuestions } from "../models";
import { BibleStoriesDataSource } from "../datasources";
import { inject } from "@loopback/core";
import { authenticate } from "@loopback/authentication";
import { PermissionKeys } from "../authorization/permission-keys";
import { JWTService } from "../services/jwt-service";

export class GeneralQuestionsController {
  constructor(
    @inject('datasources.bibleStories')
    public dataSource: BibleStoriesDataSource,
    @repository(GeneralQuestionsRepository)
    public generalQuestionsRepository: GeneralQuestionsRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) { }

  // fetching token from header and returning userProfile...
  async validateCredentials(authHeader: string) {
    try {
      if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
          throw new HttpErrors.BadRequest('Verify token! incorrect signature');
        }
        const token = parts[1];
        const userProfile = await this.jwtService.verifyToken(token);

        return userProfile
      }
    } catch (error) {
      throw error;
    }
  }

  // new question..
  @authenticate({
    strategy: 'jwt',
    options: { required: [PermissionKeys.ADMIN] },
  })
  @post('/questions', {
    responses: {
      '200': {
        description: 'Questions',
        content: {
          schema: getJsonSchemaRef(GeneralQuestions),
        },
      },
    },
  })
  async newQuestion(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GeneralQuestions, {
            exclude: ['id'],
          }),
        },
      },
    })
    questionData: Omit<GeneralQuestions, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(Stories, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      await this.generalQuestionsRepository.create(questionData, {
        transaction: tx,
      });
      await tx.commit();

      return {
        success: true,
        message: 'New question Created'
      }
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  // get Questions..
  @get('/question-list')
  async fetchQuestions(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      // checking for header
      const authHeader = request.headers.authorization;
      let currentUser: any = {};
      if (authHeader && authHeader !== '' && authHeader !== null && authHeader !== undefined && authHeader !== 'Bearer') {
        currentUser = await this.validateCredentials(authHeader);
      }
      // Fetching user for audio language
      let user: any = {}
      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      // Fetching all stories
      const questions = await this.generalQuestionsRepository.find();

      let filteredStories: any = questions;

      // Check if user exists and has an audio language preference
      if (user && user.audioLanguage) {
        // Filter stories to include only audio matching the user's selected language
        filteredStories = questions.map((question) => {
          const filteredAudios = question.audios.filter((audio: any) =>
            audio?.language?.id === user.audioLanguage
          );

          // // if any story is not available in that audio language
          // const fallbackAudios = filteredAudios.length
          //   ? filteredAudios
          //   : question.audios.filter((audio: any) => audio?.language?.code === 'en');

          if (filteredAudios.length === 0) return null;

          return {
            ...question,
            audios: filteredAudios, // Replace audios array with the filtered or fallback one
          };

        }).filter(Boolean);
      }

      // user exists but audio language yet not set then try to compare with app lang...
      // else if (user && !user.audioLanguage && user.appLanguage) {
      //   // Filter stories to include only audio matching the user's selected language
      //   filteredStories = questions.map((question) => {
      //     const filteredAudios = question.audios.filter((audio : any) => 
      //       audio?.language?.langName?.toLowerCase() === user?.appLanguage?.toLowerCase()
      //     );

      //   // if any story is not available in that audio language
      //   const fallbackAudios = filteredAudios.length
      //     ? filteredAudios
      //     : question.audios.filter((audio: any) => audio?.language?.code === 'en');

      //   return {
      //     ...question,
      //     audios: fallbackAudios, // Replace audios array with the filtered or fallback one
      //   };

      //   });
      // }

      // returning english lang audio file...
      else {
        filteredStories = questions
          .map((question) => {
            let filteredAudios = question.audios.filter((audio: any) =>
              audio?.language?.code === 'en'
            );

            // If no English, fallback to first audio (if exists)
            if (filteredAudios.length === 0 && question.audios.length > 0) {
              filteredAudios = [question.audios[0]];
            }

            // If still no audio at all, skip this question
            if (filteredAudios.length === 0) return null;

            return {
              ...question,
              audios: filteredAudios,
            };
          })
          .filter(Boolean); // remove nulls
      }

      return {
        success: true,
        message: 'questions fetched successfully',
        data: filteredStories,
      };
    } catch (error) {
      throw error;
    }
  }

  // get questions with id for admin..
  @get('/question-by-id-admin/{questionId}')
  async fetchStoryQuestionByIdForAdmin(
    @param.path.number('questionId') questionId: number
  ): Promise<{ success: boolean, message: string, data: GeneralQuestions }> {
    try {
      const question = await this.generalQuestionsRepository.findById(questionId);

      if (!question) {
        throw new HttpErrors.NotFound('Question not found');
      }

      return {
        success: true,
        message: "Question data",
        data: question
      }
    } catch (error) {
      throw error;
    }
  }

  // get question with id for customer..
  @get('/question-by-id/{questionId}')
  async fetchQuestionById(
    @param.path.number('questionId') questionId: number,
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{ success: boolean; message: string; data: object }> {
    try {
      const question = await this.generalQuestionsRepository.findById(questionId);

      if (!question) {
        throw new HttpErrors.NotFound('Question not found');
      }

      // checking for header
      const authHeader = request.headers.authorization;
      let currentUser: any = {};
      if (authHeader && authHeader !== '' && authHeader !== null && authHeader !== undefined && authHeader !== 'Bearer') {
        currentUser = await this.validateCredentials(authHeader);
      }

      let user: any = {};
      if (currentUser.id) {
        user = await this.usersRepository.findById(currentUser.id);
      }

      let filteredAudios = question.audios;

      if (user && user.audioLanguage) {
        // Filter by user's audio language, fallback to English if not found
        filteredAudios = question.audios.filter(
          (audio: any) =>
            audio.language.id === user.audioLanguage || audio.language.code === 'en'
        );
      } else if (user && !user.audioLanguage && user.appLanguage) {
        // Filter by user's app language, fallback to English
        filteredAudios = question.audios.filter(
          (audio: any) =>
            audio.language.langName?.toLowerCase() === user.appLanguage?.toLowerCase() ||
            audio.language.code === 'en'
        );
      } else {
        // Default to English audio
        filteredAudios = question.audios.filter(
          (audio: any) => audio.language.code === 'en'
        );
      }

      const filteredStory = {
        ...question,
        audios: filteredAudios,
      };

      return {
        success: true,
        message: 'question data',
        data: filteredStory,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update Question api..
  @patch('/questions/{questionId}')
  async updateQuestionById(
    @param.path.number('questionId') questionId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GeneralQuestions, { partial: true }),
        },
      },
    })
    questionData: GeneralQuestions,
  ): Promise<{ success: boolean, message: string }> {
    try {
      const question = await this.generalQuestionsRepository.findById(questionId);

      if (!question) {
        throw new HttpErrors.NotFound('Question Not Found');
      }

      await this.generalQuestionsRepository.updateById(question.id, questionData);

      return {
        success: true,
        message: "Question updated"
      }
    } catch (error) {
      throw error;
    }
  }

}