import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): MongooseModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cultural-places',
    // Configurar timezone para Argentina usando opciones de conexión
    connectionFactory: (connection) => {
      // Configurar timezone en la conexión
      connection.set('timezone', 'America/Argentina/Buenos_Aires');
      return connection;
    },
    ...(isProduction && {
      retryWrites: true,
      w: 'majority',
    }),
  };
};
