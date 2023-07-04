import { Publisher, Subjects, TicketCreatedEvent } from "@sgticketshieu/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
