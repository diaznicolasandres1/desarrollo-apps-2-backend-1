import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): MongooseModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cultural-places',
    ...(isProduction && {
      ssl: true,
      sslValidate: true,
      retryWrites: true,
      w: 'majority',
    }),
  };
};
