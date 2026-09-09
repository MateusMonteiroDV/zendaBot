import { SchedulingAIService } from "../ai/SchedulingAIService.js";
import { GroqLlmProvider } from "../ai/GroqLlmProvider.js";
import { GetAvailableSlotsUseCase } from "../../../application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { BookAppointmentUseCase } from "../../../application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "../../../application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { ListAppointmentsUseCase } from "../../../application/use-cases/scheduling/ListAppointmentsUseCase.js";

/**
 * Adaptador de retrocompatibilidade para GroqAIService.
 * Herda de SchedulingAIService utilizando o GroqLlmProvider.
 */
export class GroqAIService extends SchedulingAIService {
  constructor(
    groqClientOrApiKey?: any,
    getAvailableSlotsUseCase?: GetAvailableSlotsUseCase,
    bookAppointmentUseCase?: BookAppointmentUseCase,
    cancelAppointmentUseCase?: CancelAppointmentUseCase,
    listAppointmentsUseCase?: ListAppointmentsUseCase
  ) {
    const provider = new GroqLlmProvider(groqClientOrApiKey);
    super(
      provider,
      getAvailableSlotsUseCase,
      bookAppointmentUseCase,
      cancelAppointmentUseCase,
      listAppointmentsUseCase
    );
  }
}
