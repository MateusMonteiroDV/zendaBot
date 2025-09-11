import { ContactOwnerDto } from '../../aplicattion/dto/ContactDto'

export class Contact_user {

  constructor(
    readonly id: string,
    readonly id_user: string,
    public phone_number: string
  ) { }

  public static validPhoneNumber(owner_contact: ContactOwnerDto): Boolean {

    if (owner_contact.phone_number.length < 10 || owner_contact.phone_number.length > 10) {
      throw new Error(' Number is wrong')
    }

    return true;
  }
}








