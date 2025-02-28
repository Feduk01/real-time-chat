import { Outlet } from 'react-router-dom'
import Navigation from '../navigation/Navigation'
import './main.css'
function Main() {
  return (
    <div className="main-container">
      <Navigation />
      <Outlet />
    </div>
  )
}

export default Main
