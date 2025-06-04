import React from 'react';
import logo from './logo.svg';
import {useState} from 'react'; 


function App() {
 const [message,setMessage] = useState('');

function handleMessage(e:any):void{
    

    setMessage(e.target.value);


}

function handleClick(e:any):void{
  e.preventDefault();

  alert( message)



}


  return (
    <div >
      <header className="flex flex-col justify-center items-center gap-4 p-4  ">
            <input className = " m-5 border rounded "onChange = {handleMessage} />

            <button className = "w-50 bg-blue-500 text-white px-4" onClick = {handleClick}>
                 show message 
            </button>



      </header>
    </div>
  );
}

export default App;
