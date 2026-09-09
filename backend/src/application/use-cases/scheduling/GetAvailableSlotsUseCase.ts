import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { IGoogleCalendarService, TimeSlot } from "../../../domain/repositories/IGoogleCalendarService.js";
import { Tenant } from "../../../domain/entities/Tenant.js";
import { AppError } from "../../../domain/errors/AppError.js";
import { GetSlotsInputDto } from "../../dtos/SchedulingDto.js";

export class GetAvailableSlotsUseCase {
  constructor(
    private tenantRepository: ITenantRepository,
    private googleCalendarService: IGoogleCalendarService
  ) {}

  async execute(input: GetSlotsInputDto): Promise<TimeSlot[]> {
    if (!input.tenantId) {
      throw new AppError("tenantId é obrigatório.");
    }
    if (!input.date) {
      throw new AppError("Data é obrigatória.");
    }

    let config = await this.tenantRepository.getCalendarConfig(input.tenantId);
    if (!config) {
      config = Tenant.defaultCalendarConfig();
    }

    return await this.googleCalendarService.getAvailableSlots(config, input.date);
  }
}
