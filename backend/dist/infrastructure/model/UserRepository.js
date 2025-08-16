import pool from '../db';
export class UserRepository {
    async test() {
        try {
            const test = await pool.connect();
            const users = await test.query('select * from user_owner');
            test.release();
            return users.rows;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
    async findByEmail(email) {
        try {
            const client = await pool.connect();
            const query = {
                text: 'select email from user_owner where email = $1',
                values: [email]
            };
            const email = await client.query(query);
            client.release();
            return email[0];
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
