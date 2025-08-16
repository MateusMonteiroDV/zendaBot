import * as bcrypt from 'bcrypt';
export class LoginUserCase {
    constructor(userRepository, tokenJWT) {
        this.userRepository = userRepository;
        this.tokenJWT = tokenJWT;
    }
    async execute(user) {
        try {
            const user_owner = await this.userRepository.findByEmail({ email: user.email });
            if (!user_owner) {
                throw new Error('Email doesnt exists');
            }
            const passwordIsValid = await bcrypt.compare(user.password, user_owner.password);
            if (!passwordIsValid) {
                throw new Error('Password is wrong');
            }
            const token = await this.tokenJWT.encode(user_owner.id);
            return token;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
}
