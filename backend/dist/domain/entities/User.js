export class User {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
    static validEmail(email) {
        if (!email.includes('@') || !email.includes('gmail.com')) {
            return false;
        }
        return true;
    }
}
