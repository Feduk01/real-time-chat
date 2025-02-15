import { NavLink } from 'react-router-dom'
function Login() {
  return (
    <div>
      <h1>Login</h1>
      <button>
        <NavLink to="/main">Login</NavLink>
      </button>
    </div>
  )
}

export default Login
