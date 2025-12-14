import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { echo } from '@libp2p/echo';
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';
import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import { WebRTC } from '@multiformats/multiaddr-matcher';
import delay from 'delay';
import { ping } from '@libp2p/ping'
// import { pipe } from 'it-pipe';
import { createLibp2p } from 'libp2p';
import { multiaddr } from '@multiformats/multiaddr'
import {pushable} from 'it-pushable';
import { fromString } from 'uint8arrays';
import {kadDHT, removePrivateAddressesMapper} from '@libp2p/kad-dht'
import { lpStream } from 'it-length-prefixed-stream'
// import relay from '../../../BootstrapServer/index.js';
// import { kadDHT } from '@libp2p/kad-dht'
import gun from 'gun'
import StreamHandler from './StreamHandler.js';
const REQ_RESP_PROTOCOL = '/test-message-proto/1.0.0'

const streamHandler = new StreamHandler();


let username= 'test'

class P2PListener {
    constructor(username = 'test') {
        this.username = username;
        this.streamHandler = new StreamHandler();
        this.friendList = ['meow', 'duck'];
        this.listener = null;
        this.relayAddress = [
            multiaddr('/ip4/127.0.0.1/tcp/58285/ws/p2p/12D3KooWHZxJgimLZtxY5jnnPbDNJkZ1fvJeyEsTP2W5JEkiGwJ5')
        ];
        this.gun = gun() // add relay later
    }

    // Method to create and set up the listener
    async createListener() {
        this.listener = await createLibp2p({
            addresses: {
                listen: ['/p2p-circuit', '/webrtc'],
            },
            transports: [webSockets(), webRTC(), circuitRelayTransport()],
            connectionEncrypters: [noise()],
            streamMuxers: [yamux()],
            connectionGater: {
                denyDialMultiaddr: () => false,
            },
            services: {
                identify: identify(),
                echo: echo(),
                ping: ping(),
                dht: kadDHT({ protocol: '/ipfs/kad/1.0.0', peerInfoMapper: removePrivateAddressesMapper }),
            },
        });
    }

    // Method to dial the relay and set up WebRTC
    async dialRelay() {
        try {
            await this.listener.dial(this.relayAddress, {
                signal: AbortSignal.timeout(5000),
            });
        } catch (error) {
            console.log('Error dialing relay:', error);
        }
    }

    // Method to wait for WebRTC address to be available
    async waitForWebRTC() {
        let webRTCMultiaddr;
        while (true) {
            webRTCMultiaddr = this.listener.getMultiaddrs().find(ma => WebRTC.matches(ma));
            if (webRTCMultiaddr) {
                console.log('WebRTC Multiaddr found:', webRTCMultiaddr);
                break;
            }
            await delay(1000);
        }
        return webRTCMultiaddr;
    }

    // Method to handle incoming requests and stream
    async handleStream() {
        await this.listener.handle(REQ_RESP_PROTOCOL, async ({ connection, stream, protocol }) => {
            try {
                let remoteAddr = connection.remoteAddr;
                let friendID = multiaddr(remoteAddr).getPeerId();

                // Add the stream to the handler
                this.streamHandler.addStream(friendID, stream);

                while (true) {
                    const message = await this.streamHandler.readFromAllStreams();
                    if (message === undefined || message.length ==0) {
                        console.log('Stream stopped');
                        break;
                    }

                    console.log('Received message:', message);
                    // const res = { reply: `You sent: ${message}` };
                    // await this.streamHandler.writeToStream(friendID, JSON.stringify(res));
                    // console.log(res);
                }
            } catch (error) {
                console.log('Error handling stream:', error);
            }
        });
    }

    // Method to dial a friend by their WebRTC address
    async dialFriend(friendAddr) {
        try {
            const stream = await this.listener.dialProtocol(friendAddr, REQ_RESP_PROTOCOL, {
                signal: AbortSignal.timeout(5000),
            });
            this.streamHandler.addStream(friendAddr, stream);
            return stream;
        } catch (error) {
            console.log('Error dialing friend:', error);
        }
    }

    // Method to send messages to a friend
    async sendMessage(friendAddr, messageCount) {
        const stream = await this.dialFriend(friendAddr);
        for (let i = 0; i < messageCount; i++) {
            await this.streamHandler.writeToStream(friendAddr, `${i}`);
            console.log(`Sent message ${i}`);
        }
    }

    // Method to listen for incoming responses from streams
    async listenForResponses() {
        try {
            while (true) {
                const res = await this.streamHandler.readFromAllStreams();
                if (res[0] === undefined) {
                    console.log('No more data');
                    break;
                }
                if (res.length > 0) {
                    console.log('Received response:', res);
                }else{
                    break;
                }
            }
        } catch (error) {
            console.log('Error receiving data from streams:', error);
        }
    }

    // Start the listener and begin background tasks
    async start() {
        await this.createListener();
        await this.dialRelay();

        const webRTCMultiaddr = await this.waitForWebRTC();
        console.log('WebRTC Multiaddr:', webRTCMultiaddr);

        // Register the username and address in Gun
        this.gun.get('users').get(this.username).put(webRTCMultiaddr);
        this.gun.get('PeerID').get(multiaddr(webRTCMultiaddr).getPeerId()).put(this.username);

        // Start the listener to handle incoming connections
        this.startListening();
       
        // Optionally, you can also send messages and listen for responses here
        // await this.sendMessage(webRTCMultiaddr, 5);
        // await this.listenForResponses();
    }

    // This method will handle stream events in the background continuously
    startListening() {
        (async () => {
            try {
                // Continuously handle incoming streams
                await this.handleStream();
            } catch (error) {
                console.log('Error in startListening:', error);
            }
        })();
    }
}

export default P2PListener;

// async function ListenerFunc() {
    
// const listener = await createLibp2p({
//     addresses: {
//         listen: [
//             '/p2p-circuit',
//             '/webrtc'
//         ]
//     },
//     transports: [
//         webSockets(),
//         webRTC(),
//         circuitRelayTransport()
//     ],
//     connectionEncrypters: [noise()],
//     streamMuxers: [yamux()],
//     connectionGater: {
//         denyDialMultiaddr: () => false
//     },
//     services: {
//         identify: identify(),
//         echo: echo(),
//         ping: ping(),
//         dht: kadDHT(
//                 {protocol: '/ipfs/kad/1.0.0', peerInfoMapper: removePrivateAddressesMapper}
//         )
//     }
// });
// // the listener dials the relay (or discovers a public relay via some other
// // method), important for hole punching in NAT-wall case
// let relayAddress = [multiaddr('/ip4/127.0.0.1/tcp/36221/ws/p2p/12D3KooWCKzPLGpXhXVqrdo68qqBxgpxj2gWS76jjdgEykgC9XuK')]
// if(relayAddress){
//     try {
//         await listener.dial(relayAddress, {
//             signal: AbortSignal.timeout(5000)
//         });
//     } catch (error) {
//         console.log('error in dialing relay')
//     }

// let webRTCMultiaddr;
// // wait for the listener to make a reservation on the relay

//     while (true) {
//     webRTCMultiaddr = listener.getMultiaddrs().find(ma => WebRTC.matches(ma));
//     if (webRTCMultiaddr != null) {
//         console.log(webRTCMultiaddr);
//         break;
//     }
//     // try again later
//     await delay(1000);
//     }


// }
// let friendList = ['meow', 'duck']
// // let friendMultaddressses
// // friendList.forEach(fr => {
// //     let val =listener.services.dht.get(fromString(fr))
// //     if(val != nil)
// //         friendMultaddressses.push(val)  

// // });

// await listener.handle(REQ_RESP_PROTOCOL, ({connection, stream, protocol }) => {
//   Promise.resolve().then(async () => {
//     // lpStream to read/write in a predetermined order for synced messages
//     // const lp = lpStream(stream)
//     // getting PeerID from connection req, then search for corresponding username in GUN_DB to add stream
//     let remoteAddr = connection.remoteAddr
//     let friendID = multiaddr(remoteAddr).getPeerId()
//     // let friendName =null;
//     // gun.get('PeerID').get(friendID).once((data,key)=>{
//     //     friendName = data;
//     // })
//     // if(friendList.includes(friendName)){
//         streamHandler.addStream(friendID, stream)
//     // }
    
//     //  while (true) {
//         // Read the incoming request
//         // const req = await lp.read()
//     try {
//         while(true){    
//     //   for await(const message of streamHandler.readFromAllStreams()){
//         const message = await streamHandler.readFromAllStreams()
//         if (message==undefined) {
//             // stream has been closed, break the loop
//             console.log('stream stopped')
//             // streamHandler.stopStream(friendID)
//             break;
//         }
//         console.log(message)
//         // console.log(req)
//         // Process the request
//         // req.subArray is important af or it wont read the uint field in protobuf
//         // const message = new TextDecoder().decode(fromString(req.subarray()));
    
   
//         if(message){
//              const res = { reply: `You sent: ${message}` };
//              await streamHandler.writeToStream(friendID, JSON.stringify(res));
    
      
//              console.log(res)
//         }
//     }
//   }  catch (error) {
//             console.log("Handler responding issue: ", error)
//             // break;
//         }
//     // }
//         // Send the response back
        
//         // Send the response back
//         // await lp.write(new TextEncoder().encode(JSON.stringify(res)));
//         // await streamHandler.writeToStream(friendName,JSON.stringify(res) )
    

//   })
// })

// // gun.get('users').get(username).put(webRTCMultiaddr); // added entry to search us
// // gun.get('PeerID').get(multiaddr(webRTCMultiaddr).getPeerId()).put(username) // entry to verify incoming req by reciever

// // console.log(webRTCMultiaddr)
// // stream for each Friend in FriendList
// // friendList.forEach(async friend => {



//     let RTCaddr = multiaddr('/ip4/127.0.0.1/tcp/36221/ws/p2p/12D3KooWCKzPLGpXhXVqrdo68qqBxgpxj2gWS76jjdgEykgC9XuK/p2p-circuit/webrtc/p2p/12D3KooWEofNp2JHpseTHc6xX7WdviEmaQ5QqgnHsvBzebkUbX7g');
// //     gun.get('users').get(friend).once((data,key)=>{
// //         RTCaddr = data;
// //     })
// let stream;
// try {
//      stream = await listener.dialProtocol(RTCaddr, REQ_RESP_PROTOCOL, {
//         signal: AbortSignal.timeout(5000)
//     });
    
// } catch (error) {
//     console.log('Reservation issue with relay:', error)
// }

//     streamHandler.addStream(RTCaddr, stream);
//     for (let i = 0; i < 5; i++) {

//         //   await lp.write(new TextEncoder().encode(`${i}`))
//         await streamHandler.writeToStream(RTCaddr, `${i}`);
//         console.log(i)
//         //   console.log(i)
        
//     }



// // });

// // const lp = lpStream(stream)

// // for (let i = 0; i < 3; i++) {

// // //   await lp.write(new TextEncoder().encode(`${i}`))
// //    console.log(i)
// // //   console.log(i)
// // }

//   try {  

// // loop to read incoming message on each
//     while(true){
//     // for await(const res of streamHandler.readFromAllStreams()){
//         //   const res = await lp.read();
//         const res = await streamHandler.readFromAllStreams()
//         //   console.log(new TextDecoder().decode(res.subarray()))
//         // const response = JSON.parse(new TextDecoder().decode(res.subarray()));
//         if(res[0]==undefined){console.log('no more return data'); break;}
//     if(res.length >0){ 
//         console.log(`Received response:`, res);
//         }
//         // if(response.length==0) {streamHandler.stopStream('meow'); break;}
//     }} catch (error) {
//         console.log("Recieving data error from streams:", error)
//     }
// }
// export default ListenerFunc