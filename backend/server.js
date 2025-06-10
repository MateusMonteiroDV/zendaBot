const express  = require('express');
const app = express();



app.get('/', (req, res)=>{

    return res.end('Hello world');
})


app.listen(5000, ()=>{

		console.log('Listeninfsdffdsafsdfafsdg on port 5000 ');

})