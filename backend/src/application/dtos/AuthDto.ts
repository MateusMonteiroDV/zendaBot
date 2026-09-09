export interface RegisterUserInputDto {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  calendarId?: string;
}

export interface LoginUserInputDto {
  email: string;
  password: string;
}

export interface AuthOutputDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
