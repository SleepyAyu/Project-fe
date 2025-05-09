import Avatar from "./Avatar";

export default function Contact(id,username,onClick,selected,online){
    return(
        <div key ={id} onClick={()=> onClick(id)} 
            className={"border-b border-gray-100 flex gap-2 items-center cursor-pointer " + (selected ? 'bg-yellow-50' : '')}>
                {selected && (
                    <div className="w-1 bg-yellow-700 h-12 rounded-r-md"></div>
                )}
                <div className="flex gap-2 py-2 pl-4 item-center">
                    <Avatar online={online} username = {username} userId={id}/>
                    <span className="">
                        {username}
                    </span>
                </div>
        </div>
    )
}