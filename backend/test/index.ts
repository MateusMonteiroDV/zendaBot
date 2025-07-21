import {UserRepository} from '../infrastructure/model/UserRepository'
import {UserOwnerDto} from '../aplicattion/dto/UserDto'
import {v4 as generate_uuid} from 'uuid'

const userRepository:UserRepository  = new UserRepository();



const user:UserOwnerDto = {
	id:generate_uuid(),
	name:'ciclano',
	email:'ciclano@gmail.com',
	password:'1234'
}



userRepository.save(user).
then(() =>{
	console.log('sucedd' )


}).catch(err=>{
	console.log(err)

})
