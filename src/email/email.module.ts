import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailConfigService } from './services/email-config.service';
import { EmailSenderService } from './services/email-sender.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailAttachmentService } from './services/email-attachment.service';

@Module({
  providers: [
    EmailService,
    EmailConfigService,
    EmailSenderService,
    EmailTemplateService,
    EmailAttachmentService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
