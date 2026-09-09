export interface BookAppointmentInputDto {
  tenantId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  serviceName?: string;
  notes?: string;
}

export interface BookAppointmentOutputDto {
  id: string;
  googleEventId: string;
  tenantId: string;
  clientName: string;
  clientPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  summary: string;
}

export interface CancelAppointmentInputDto {
  tenantId: string;
  eventIdOrPhone: string;
}

export interface GetSlotsInputDto {
  tenantId: string;
  date: string; // YYYY-MM-DD
}
