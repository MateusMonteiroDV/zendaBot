import dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' });
import { User } from '../../../domain/entities/User.js';
import { v4 as generate_uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
export class RegisterUserCase {
    constructor(userRepository, tokenJWT) {
        this.userRepository = userRepository;
        this.tokenJWT = tokenJWT;
    }
    async execute(user) {
        try {
            if (await this.userRepository.findByEmail({ email: user.email })) {
                throw new Error('Email already exists');
            }
            const saltRound = 10;
            const salt = await bcrypt.genSalt(saltRound);
            const hash_password = await bcrypt.hash(user.password, salt);
            const id_user = await generate_uuid();
            const isValid = await User.validEmail({ email: user.email });
            if (!isValid) {
                throw new Error('Email doenst include @ or gmail.com');
            }
            const user_owner = new User(id_user, user.name, user.email, hash_password);
            await this.userRepository.save(user_owner);
            const token = await this.tokenJWT.encode({ id: id_user });
            return token;
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }
}
