import { useState } from "react"

export default function Login() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  })

  async function handleName(e) {
    setUser(prev => ({
      ...user,
      name: e.target.value
    }))
  }

  async function handleEmail(e) {
    setUser(prev => ({
      ...user,
      email: e.target.value
    }))
  }

  async function handlePassword(e) {
    setUser(prev => ({
      ...user,
      password: e.target.value
    }))
  }


  async function handleSubmit(e) {
    e.preventDefault()
  }
  return (
    <>
      <main className="flex flex-col h-screen w-screen justify-center items-center">
        <h2 className="m-5 "> Register for enter in zendaBot</h2>
        <form className="flex flex-col justify-center p-20 items-center gap-5  shadow-md" onSubmit={handleSubmit}>
          <input className="border-2" onChange={handleName} placeholder=" enter your name"></input>
          <input className=" border-2" onChange={handleEmail} placeholder=" enter your email"></input>
          <input className="border-2" onChange={handlePassword} placeholder=" enter your password"></input>
          <button className=" px-6 py-2 shadow-md rounded-lg bg-blue-600 text-white">regiter</button>
        </form>
      </main>
    </>
  )
} 
