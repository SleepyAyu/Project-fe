import axios from "axios";
import { useContext, useState } from "react"
import { UserContext } from "./UserContext";

export default function Register(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLogInOrRegister] = useState('register')
    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

    async function handleSubmit(ev){
      ev.preventDefault();
      const url = isLoginOrRegister === 'register' ? 'register' : 'login'
      const {data} = await  axios.post(url, {username,password})
      setLoggedInUsername(username)
      setId(data.id)
    }
  return(
    <div className= "bg-cyan-50 h-screen flex items-center">
        <form className="w-64 mx-auto"
            onSubmit={handleSubmit}>
            <input value={username}
                onChange={ev=> setUsername(ev.target.value)}
                type="text"
                placeholder="username"
                className="bg-white block w-full rounded-sm p-2 mb-2 border"/>
            <input value={password}
                onChange={ev=> setPassword(ev.target.value)}
                type="password"
                placeholder="password"
                className="bg-white block w-full rounded-sm p-2 mb-2 border"/>
            <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
            </button>
            <div className="text-center mt-2"> 
              {isLoginOrRegister === 'register' && (
                <div>
                  Already a member?
                  <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}> 
                    Login here
                  </button>
                </div>
              )}
              {isLoginOrRegister === 'Login' && (
                <div>
                  Don't have an account?
                  <button className="ml-1" onClick={() => setIsLogInOrRegister('register')}> 
                    Register 
                  </button>
                </div>                
              )}
            </div>
        </form>
    </div>
  )  
}