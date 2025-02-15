import { NavLink } from 'react-router-dom'
function Navigation() {
  return (
    <nav className="side-nav">
      <ul>
        <li>
          <NavLink to="/main/direct-messages">Direct Messages</NavLink>
        </li>
        <li>
          <NavLink to="/main/group-messages">Group Messages</NavLink>
        </li>
        <li>
          <NavLink to="/main/ai-chat">AI Chat</NavLink>
        </li>
        <li>
          <NavLink to="/main/users">Users</NavLink>
        </li>
        <li>
          <NavLink to="/">Logout</NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
