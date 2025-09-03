import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CulturalPlacesService } from './cultural-places.service';
import { CulturalPlacesController } from './cultural-places.controller';
import { CulturalPlace, CulturalPlaceSchema } from './schemas/cultural-place.schema';
import { MongoDBCulturalPlaceRepository } from './repositories/mongodb-cultural-place.repository';
import { ICulturalPlaceRepository, CULTURAL_PLACE_REPOSITORY } from './interfaces/cultural-place.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CulturalPlace.name, schema: CulturalPlaceSchema },
    ]),
  ],
  controllers: [CulturalPlacesController],
  providers: [
    CulturalPlacesService,
    {
      provide: CULTURAL_PLACE_REPOSITORY,
      useClass: MongoDBCulturalPlaceRepository,
    },
  ],
  exports: [CulturalPlacesService],
})
export class CulturalPlacesModule {}
