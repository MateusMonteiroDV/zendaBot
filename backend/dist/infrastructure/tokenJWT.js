require('dotenv').config('../.env');
import { jsonwebtoken as jwt } from 'jsonwebtoken';
export class TokenJWT {
    constructor(secret, expires) {
        this.secret = secret;
        this.expires = expires;
    }
    async encode(payload) {
        try {
            const token = await jwt.sign(payload, this.secret, { expiresIn: this.expires });
            return token;
        }
        catch (err) {
            console.log(err);
            return err;
        }
    }
    async decode() {
    }
}
