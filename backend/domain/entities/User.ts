import { UserOwnerDtoEmail } from '../../aplicattion/dto/UserDto'

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string
  ) { }

  public static validEmail(email: string): Promise<boolean> {

    if (!email.includes('@') || !email.includes('gmail.com')) {
      return Promise.resolve(false)


    }

    return Promise.resolve(true)
  }

}





