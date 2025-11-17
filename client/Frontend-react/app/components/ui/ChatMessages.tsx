import React from 'react'

function ChatMessages({message='test message', imageURL="/favicon.ico"} : any ) {
  return (
    <div className='bg-blue-300 overflow-hidden rounded-2xl p-2 items-center flex text-accent-foreground w-[50%] xs:hidden'>
      <span ><img className='h-8 w-8  bg-stone-500 rounded-full mr-2' src={imageURL} alt="/favicon.ico"/></span> <span className=' overflow-clip'>{message}</span>  
    </div>
  )
}



export default ChatMessages