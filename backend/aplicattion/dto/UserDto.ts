export interface WhatSendMessageDto {
  to: string | null;
  text: string | null;
}

export interface ChatMessageDto {
  text?: string | null;
}
export interface UserDtoToken {
  id: string;
}

export interface UserOwnerDtoEmail {
  email: string;
}
export interface UserOwnerDb {
  id: string;
  user_name: string;
  email: string;
  user_password: string;
  created_at: Date;
}

export interface UserOwnerDto {
  id: string;
  name: string;
  email: string;
  password: string;
}
export interface UserOwnerRegisterInputDto {
  name: string;
  email: string;
  password: string;
}
export interface UserOwnerLoginInputDto {
  email: string;
  password: string;
}
export type UserOwnerRegiserOutputDto = string;

export interface UserOwnerResponseDto {
  id: string;
}
