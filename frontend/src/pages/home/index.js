import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sideBar'



export default function Home() {


  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  );
}




