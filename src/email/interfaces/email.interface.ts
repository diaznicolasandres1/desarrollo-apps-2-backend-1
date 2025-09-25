import { Ticket } from '../../tickets/schemas/ticket.schema';
import { Event } from '../../events/schemas/event.schema';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  cid: string;
  contentType: string;
}

export interface TicketPurchaseEmailData {
  userEmail: string;
  userName: string;
  event: Event;
  tickets: Ticket[];
  totalAmount: number;
}

export interface EventModificationEmailData {
  userEmail: string;
  userName: string;
  event: any;
  modificationType: string;
  oldValue: any;
  newValue: any;
  ticketCount: number;
  ticketTypes: string[];
}

export interface EventCancellationEmailData {
  userEmail: string;
  userName: string;
  event: any;
  ticketCount: number;
  ticketTypes: string[];
  cancellationReason?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplateData {
  userName: string;
  event: Event | any;
  tickets?: Ticket[];
  totalAmount?: number;
  modificationType?: string;
  oldValue?: any;
  newValue?: any;
  ticketCount?: number;
  ticketTypes?: string[];
  cancellationReason?: string;
}
