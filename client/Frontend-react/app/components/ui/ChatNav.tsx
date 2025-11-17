import React from 'react'
// import { Navbar12 } from '../../components/ui/navbar-12';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "../../components/ui/navigation-menu"
import { Link } from 'react-router'
import { Button } from './button'
function ChatNav() {
  return (
    <div>
        <nav className='w-full flex justify-between pr-4 pl-4 p-2 mb-12'>
            <span> Test</span>
            <span className='ml-3 flex '>
                <Button variant={'ghost'} className='mr-4 border-2 border-amber-100'>Call</Button>
                <Button variant={'ghost'} className='mr-4 border-2 border-amber-100'>Video Call</Button>
            </span>
        </nav>
    </div>
  )
}

export default ChatNav