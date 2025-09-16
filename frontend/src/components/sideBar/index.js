import { Link } from 'react-router-dom'
export default function Sidebar() {


  return (
    <header className="flex justify-center items-center bg-black text-white gap-4 p-4">
      <Link to='/login'>logar</Link>
      <Link to='/register'>register</Link>
      <Link to='price'>price</Link>
      <Link to='/about'>about</Link>
      <Link to='/about'>about</Link>
    </header>




  );
}
