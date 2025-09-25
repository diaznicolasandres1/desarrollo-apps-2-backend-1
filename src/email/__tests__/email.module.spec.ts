import { Test, TestingModule } from '@nestjs/testing';
import { EmailModule } from '../email.module';
import { EmailService } from '../email.service';

describe('EmailModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Set up environment variables for testing
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpass';
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_FROM = 'noreply@test.com';

    module = await Test.createTestingModule({
      imports: [EmailModule],
    }).compile();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_FROM;
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide EmailService', () => {
    const emailService = module.get<EmailService>(EmailService);
    expect(emailService).toBeDefined();
  });
});
