import { Button } from "~/components/ui/button";
import type { Route } from "./+types/dashboard";
// import { Welcome } from "../welcome/welcome";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"
import { Card, CardContent } from "~/components/ui/card";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
  // useEffect(() => {
  //   const checkApiAvailability = () => {
  //     if (window.api) {
  //       console.log('window.api is available', window.api);
  //       window.api.sendMessage('get-data', { someData: 'value' });
  //       window.api.onMessage('data-received', (event, receivedData) => {
  //         console.log('chutiya api')
  //       });
  //     } else {
  //       console.log('Waiting for window.api...');
  //       setTimeout(checkApiAvailability, 100);  // Retry after 100ms
  //     }
  //   };

  //   checkApiAvailability();
  // }, []); 





export default function dashboard() {

//  && typeof window.api.sendMessage === 'function'
const generateKeyPairs= async()=> {

 const data= await window.api.generateKeyPairs("test");
  console.log(data);
  // window.api.onMessage("recieveKeyPairs", (data: any)=>{
  //   console.log(data);
  // })
}

  return(
    <>
      <div className="flex flex-1 flex-col items-center w-full">
        <h1 className="text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Welcome to SAFEY</h1>
        <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Decentralized Chat app for privacy</span>
      </div>
      <div className="mt-16 pl-16 text-card-foreground text-xs  pr-16 flex flex-col items-center w-full">
        <div className="w-lg">
        <span >
            Purpose of this software to enable private encrypted texting between friends. Devoid of middleman servers like whatsapp and instagram uses.
        </span>
        <span > Though, i had to add a relay mechanism for temporary storage while reciever is offline. It can be hosted privately too anyways</span>
        </div>
      </div>

      <div className="mt-8 w-full items-center justify-center flex gap-2 ">
        <Button onClick={generateKeyPairs}>Get Started</Button>
        <Button className="bg-accent-foreground hover:bg-accent hover:text-black"> Learn more</Button>
      </div>

            {/*  50% on small screens and 33% on larger screens. */}
      <div className="flex w-full text-accent-foreground justify-center mt-8">
         <Carousel opts={{align: "start",}} className="w-full max-w-lg">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-3xl font-semibold">{index + 1}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant={"secondary"} />
            <CarouselNext variant={"secondary"} />
          </Carousel>

      </div>

      

    </>
    )
}
