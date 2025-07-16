
import {ContactOwnerDto} from '../../aplicattion/dto/ContactDto'


class Contact_user {

	constructor(
		readonly id:string,
		readonly id_user:string,
		public phone_number:string
)	{}

	public static validPhoneNumber(owner_contact: dtoContactOwner):Contact_user{

			if(owner_contact.phone_number.length < 10 || owner_contact.phone_number.length > 10 ){

					 throw new Error(' Number is wrong')

			}		


		return new  Contact_user(owner_contact.id, owner_contact.id_user, owner_contact.phone_number)
	}				



}
  



const contact: Contact_user =  new Contact_user('4156456', '1524156415', '1651561561' )


console.log(contact);
