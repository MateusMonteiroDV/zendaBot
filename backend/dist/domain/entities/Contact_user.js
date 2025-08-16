class Contact_user {
    constructor(id, id_user, phone_number) {
        this.id = id;
        this.id_user = id_user;
        this.phone_number = phone_number;
    }
    static validPhoneNumber(owner_contact) {
        if (owner_contact.phone_number.length < 10 || owner_contact.phone_number.length > 10) {
            throw new Error(' Number is wrong');
        }
        return new Contact_user(owner_contact.id, owner_contact.id_user, owner_contact.phone_number);
    }
}
const contact = new Contact_user('4156456', '1524156415', '1651561561');
console.log(contact);
export {};
