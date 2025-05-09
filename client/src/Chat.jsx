import { useContext, useEffect, useState } from "react"
import Logo from "./Logo"
import { UserContext } from "./UserContext"
import axios from "axios"
import Contact from "./Contact"
import { uniqBy } from "lodash"

export default function Chat(){
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [offlinePeople, setOfflinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState('')
    const {username, id, setId, setUsername} = useContext(UserContext)
    const [messages, setMessages] = useState([])
    const divUnderMessages = useRef()

    useEffect(() => {
        connectToWs()
    }, [])

    function connectToWs(){
        const ws = new WebSocket('ws://localhost:4040')
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Try to reconnect')
            }, 1000)
        })
    }

    function showOnlinePeople(peopleArray){
        const people = {}
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username
        })
        setOnlinePeople(people)
    }

    function handleMessage(ev){
        const messageData = JSON.parse(ev.data)
        console.log({ev, messageData})
        if('online' in messageData){
            showOnlinePeople(messageData.online)
        }
        else if('text' in messageData){
            if(message.sender === selectedUserId){
                setMessages(prev => ([...prev, {...messageData}]))
            }
        }
    }

    function sendMessage(ev, file =null){
        if(ev)ev.preventDefault()
        ws.send(JSON.stringify({
            message: {
                recipient: selectedUserId,
                text: newMessageText,
                file,
            }
        }))

        setNewMessageText('')
        setMessages(prev => {[...prev,{
            text: newMessageText, 
            sender: id, 
            recipient: selectedUserId, 
            _id: Date.now()
        }]})
        if(file){
            axios.get('/messages/'+selectedUserId).then(res =>{
                setMessages(res.data)
            })
        }
    }

    function sendFile(ev){
        const reader = new FileReader()
        reader.readAsDataURL(ev.target.files[0])
        reader.onload = () => {
            sendMessage(null, {
                info:ev.target.files[0],
                data:reader.result,
            })
        }
    }

    function logout(){
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null)
            setUsername(null)
        })
    }

    //scrolling
    useEffect(() =>{
        const div = divUnderMessages.current
        if(div){
            div.scrollIntoView({behavior:'smooth', block: 'end'})
        }
    },[messages])

    //offline
    useEffect(() =>{
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data.filter(p => p._id !== id)
            .filter(p => !Object.keys(onlinePeople).includes(p._id))
            const offlinePeople = {}
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p
            })
            setOfflinePeople(offlinePeople)
        })
    }, [onlinePeople])

    useEffect(() =>{
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId).then(res =>{
                setMessages(res.data)
            })
        }
    },[selectedUserId])

    const onlinePeopleExclUs = {...onlinePeople}
    delete onlinePeopleExclUs[id]

    const woDupes = uniqBy(messages, '_id')

    return(
        <div className="flex h-screeen">
            <div className="bg-grey-50 w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo/>
                    {/* shows onlinePeople */}
                    {Object.keys(onlinePeopleExclUs).map(userId => (
                        <Contact 
                        key={userId}
                        id ={userId} 
                        online = {true}
                        username = {onlinePeopleExclUs[userId]} 
                        onClick={() => selectedUserId(userId)}
                        selected={userId === selectedUserId} />
                    ))}
                    {/* shows offl p */}
                    {Object.keys(offlinePeople).map(userId => (
                        <Contact 
                        key={userId}
                        id ={userId} 
                        online = {false}
                        username = {offlinePeople[userId].username} 
                        onClick={() => selectedUserId(userId)}
                        selected={userId === selectedUserId} />
                    ))}
                </div>
            </div>
            <div className="p-2 text-center">
                    <button onClick={logout} className="text-sm text-black-100 bg-yellow-100 px-2 py-1 border rounded-md">Logout</button>
            </div>
            <div className="flex flex-col bg-grey-100 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex h-full flex-grow items-center justify-center">
                            <div className="text-grey-400">Start a conversation</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        // message related
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 right-0 left-0 bottom-2">
                                {woDupes.map(message => (
                                    <div key={message._id} className={(message.sender === id? 'text-right' : 'text-left')}>
                                        <div className={"text-left inline-block p-2 my-2 rounded-md text-sm" + (message.sender === id? 'bg-yellow-400 text-black' : 'bg-grey-400 text-white' )}>
                                            {message.text}
                                            {message.file && (
                                                <div>
                                                    <a target="_blank" className="flex items-center border-b gap-1" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        strokeWidth={1.5} 
                                                        stroke="currentColor" 
                                                        className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                                    </svg>
                                                        {message.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>  
                    )}
                </div>

                {!!selectedUserId && (
                    // message box
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text"
                            value={newMessageText}
                            onChange={ev => setNewMessageText(ev.target.value)}
                            placeholder="write a message" 
                            className="bg-grey-50 flex-grow border p-2 rounded-xl" />

                        {/* attach file */}
                        <label className="bg-yellow-100 p2 rounded-xl">
                            <input type="file" className="hidden" onChange={sendFile}/>
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                            </svg>
                        </label>

                        {/* send button */}
                        <button type="submit" className="bg-yellow-100 p-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" c
                                lassName="size-6">
                                    <path strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                    />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}