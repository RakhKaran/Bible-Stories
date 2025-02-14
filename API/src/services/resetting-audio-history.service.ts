import { BindingScope, inject, injectable } from "@loopback/core";
import { repository } from "@loopback/repository";
import { AudioHistoryRepository } from "../repositories";
import { BibleStoriesDataSource } from "../datasources";

@injectable({ scope: BindingScope.TRANSIENT })
export class AudioHistoryService {
      constructor(
        @inject('datasources.bibleStories')
        public dataSource: BibleStoriesDataSource,
        @repository(AudioHistoryRepository)
        public audioHistoryRepository : AudioHistoryRepository
      ) {}
}