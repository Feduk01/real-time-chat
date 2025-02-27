import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import StartPage from './components/startPage/StartPage'
import Login from './components/login/Login'
import Main from './components/layout/Main'
import AuthProvider from './components/AuthProvider'
import AIChatContentView from './components/contentView/AIChatContentView/AIChatContentView'
import DirectMessagesContentView from './components/contentView/DirectMessagesContentView/DirectMessagesContentView'
import GroupMessagesContentView from './components/contentView/GroupMessagesContentView/GroupMessagesContentView'
import UsersContentView from './components/contentView/UsersContentView/UsersContentView'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="login" element={<Login />} />

            <Route path="main" element={<Main />}>
              <Route index element={<DirectMessagesContentView />} />
              <Route
                path="direct-messages"
                element={<DirectMessagesContentView />}
              />
              <Route
                path="group-messages"
                element={<GroupMessagesContentView />}
              />
              <Route path="ai-chat" element={<AIChatContentView />} />
              <Route path="users" element={<UsersContentView />} />
            </Route>
          </Routes>
        </AuthProvider>
      </div>
    </BrowserRouter>
  )
}

export default App
