import { NavLink } from 'react-router-dom'
function StartPage() {
  return (
    <div>
      <h1>Start-Page</h1>
      <button>
        <NavLink to="/login">Go</NavLink>
      </button>
    </div>
  )
}

export default StartPage
