export default function Avatar({userId, username, online}){
    return(<div className="w-10 h-10 relative bg-yellow rounded-full flex items-center">
        <div className="text-center w-full text-black">
            {username[0]}
        </div>
        {online && (
            <div className="absolute w-2 h2 bg-green-400 rounded-full bottom-0 right-0 border border-white"></div>
        )}

        {!online && (
            <div className="absolute w-2 h2 bg-grey-400 rounded-full bottom-0 right-0 border border-white"></div>
        )}
    </div>)

}