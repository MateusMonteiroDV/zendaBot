export class User {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
    static validEmail(dto) {
        const { email } = dto;
        if (!email.includes('@') || !email.includes('gmail.com')) {
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }
}
