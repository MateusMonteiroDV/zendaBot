export interface TokenPayload {
  id: string;
  email?: string;
}

export interface ITokenService {
  encode(payload: TokenPayload): Promise<string>;
  decode(token: string): Promise<TokenPayload>;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
