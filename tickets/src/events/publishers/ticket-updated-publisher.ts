import { Publisher, Subjects, TicketUpdatedEvent } from "@sgticketshieu/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
