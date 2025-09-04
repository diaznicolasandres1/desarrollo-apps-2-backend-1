import { getDatabaseConfig } from './database.config';

describe('DatabaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getDatabaseConfig', () => {
    it('should return default configuration when no environment variables are set', () => {
      delete process.env.MONGODB_URI;
      delete process.env.NODE_ENV;

      const config = getDatabaseConfig();

      expect(config.uri).toBe('mongodb://localhost:27017/cultural-places');
      expect(config.retryWrites).toBeUndefined();
      expect(config.w).toBeUndefined();
    });

    it('should use MONGODB_URI from environment variables', () => {
      process.env.MONGODB_URI = 'mongodb://test:27017/test-db';
      delete process.env.NODE_ENV;

      const config = getDatabaseConfig();

      expect(config.uri).toBe('mongodb://test:27017/test-db');
      expect(config.retryWrites).toBeUndefined();
      expect(config.w).toBeUndefined();
    });

    it('should include production options when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      process.env.MONGODB_URI = 'mongodb://prod:27017/prod-db';

      const config = getDatabaseConfig();

      expect(config.uri).toBe('mongodb://prod:27017/prod-db');
      expect(config.retryWrites).toBe(true);
      expect(config.w).toBe('majority');
    });

    it('should not include production options when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      process.env.MONGODB_URI = 'mongodb://dev:27017/dev-db';

      const config = getDatabaseConfig();

      expect(config.uri).toBe('mongodb://dev:27017/dev-db');
      expect(config.retryWrites).toBeUndefined();
      expect(config.w).toBeUndefined();
    });

    it('should handle empty MONGODB_URI environment variable', () => {
      process.env.MONGODB_URI = '';
      delete process.env.NODE_ENV;

      const config = getDatabaseConfig();

      expect(config.uri).toBe('mongodb://localhost:27017/cultural-places');
    });
  });
});
