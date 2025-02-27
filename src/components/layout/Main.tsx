import { Outlet } from 'react-router-dom'
import Navigation from '../navigation/Navigation'
function Main() {
  return (
    <div>
      <Navigation />
      <Outlet />
    </div>
  )
}

export default Main
