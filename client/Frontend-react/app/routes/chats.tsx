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
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleInvokeApi = async () => {
    try {
      if (window.api) {
           // @ts-ignore
        const response = await window.api.getFriendList();
        console.log('API response:', response);
        setApiResponse(response.show);
      } else {
        console.error("Electron is not available.");
      }
    } catch (error) {
      console.error('Error invoking API:', error);
    }
  };

  return (
    <div className='text-accent h-full'>
        <Separator dir='horizontal' className='border-2 bg-border'/>
        
        <ResizablePanelGroup direction="horizontal">
          {/* @ts-ignore */}
        <ResizablePanel className='m-4'>One       <button onClick={handleInvokeApi}>Invoke API</button>
      {apiResponse && (
        <div>
          <h2>API Response:</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}</ResizablePanel>
        <ResizableHandle className='border-2 ' />
        <ResizablePanel className='m-4'>
           <ChatNav/>
           <ScrollArea className='border-2 h-[65%] '>
            <ChatMessages/> 
           </ScrollArea>
           
        </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  )
}

export default chats