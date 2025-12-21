import React, { useEffect, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable"
import { Separator } from '~/components/ui/separator'
import ChatMessages from '~/components/ui/ChatMessages'
import ChatNav from '~/components/ui/ChatNav'
import { ScrollArea } from '~/components/ui/scroll-area'
function chats() {
   // @ts-ignore
  useEffect(() => {
    // Check if window.electron is available
       // @ts-ignore
    if (window.api) {
      console.log("Electron API available.");
    } else {
      console.error("Electron API not available.");
    }
  }, []);
  const [apiResponse, setApiResponse] = useState<any>([]);
  const [selectedDM, setSelectedDM] = useState<String | null>(null);
  const [chat, setChat] = useState<any>([]);
  useEffect(()=>{
    
  },[selectedDM])
  const handleInvokeApi = async () => {
    try {
        // @ts-ignore
      if (window.api) {
           // @ts-ignore
        const response = await window.api.getFriendList();
        console.log('API response:', response);
        setApiResponse(response);
      } else {
        console.error("Electron is not available.");
      }
    } catch (error) {
      console.error('Error invoking API:', error);
    }
  };
  async function sendMessage(friend :String, message: String){
    console.log('function called to sendMessage')
    // @ts-ignore
    await window.api.sendMessage(friend,message)
  }

  return (
    <div className='text-accent h-full'>
        <Separator dir='horizontal' className='border-2 bg-border'/>
        
        <ResizablePanelGroup direction="horizontal">
          {/* @ts-ignore */}
        <ResizablePanel className='m-4'>One       <button onClick={handleInvokeApi}>Refresh DMs</button>
      {apiResponse && (
        apiResponse.map((item : String,index : number)=>(<div onClick={()=>{setSelectedDM(item)}} key={index}>{item}</div>))
      )}</ResizablePanel>
        <ResizableHandle className='border-2 ' />
        <ResizablePanel className='m-4'>
           <ChatNav/>
           <ScrollArea className='border-2 h-[65%] '>
            <ChatMessages/> 
            <button onClick={()=>{sendMessage('meow', 'test message to meow1')}}> click to send test message to "meow"</button>
           </ScrollArea>
           
        </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  )
}

export default chats