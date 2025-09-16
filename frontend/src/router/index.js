import { Routes, Route, BrowserRouter } from "react-router-dom"
import Login from "../pages/login"
import Register from "../pages/register"
import Home from "../pages/home"

export default function RouterApp() {
  return (
    <>
      <BrowserRouter>


        <Routes>
          <Route path='register' element={<Register />} />
          <Route path='/' element={<Home />}>
            <Route path='login' element={<Login />} />
            <Route path='about' element={<Register />} />
            <Route path='price' element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
