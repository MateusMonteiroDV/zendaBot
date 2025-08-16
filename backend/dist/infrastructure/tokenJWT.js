require('dotenv').config('../.env');
import * as jwt from 'jsonwebtoken';
export class TokenJWT {
    constructor(secret, expires) {
        this.secret = secret;
        this.expires = expires;
    }
    async encode(payload) {
        try {
            const token = jwt.sign(payload, this.secret, { expiresIn: this.expires });
            return token;
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }
    async decode() {
    }
}
