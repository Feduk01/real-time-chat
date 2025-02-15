import { Outlet } from 'react-router-dom'
import Navigation from '../navigation/Navigation'
function Main() {
  return (
    <div>
      <h1>Main</h1>
      <Navigation />
      <Outlet />
    </div>
  )
}

export default Main
