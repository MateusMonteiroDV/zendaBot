import pool from '../db.js';
export class UserRepository {
    async findByEmail(email) {
        try {
            const client = await pool.connect();
            const query = {
                text: 'select email from user_owner where email = $1',
                values: [email]
            };
            const result = await client.query(query);
            client.release();
            return result.rows[0];
        }
        catch (err) {
            console.log(err);
            throw new Error('Error to find email' + err);
        }
    }
    async save(user) {
        const client = await pool.connect();
        const query = {
            text: 'insert into user_owner(id, user_name, email, user_password) values($1, $2, $3, $4)',
            values: [user.id, user.name, user.email, user.password]
        };
        await client.query(query);
        client.release();
    }
}
