import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { echo } from '@libp2p/echo';
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { identify, identifyPush } from '@libp2p/identify';
import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import { WebRTC } from '@multiformats/multiaddr-matcher';
import delay from 'delay';
// import { pipe } from 'it-pipe';
import { createLibp2p } from 'libp2p';
import { ping } from '@libp2p/ping'
import {pushable} from 'it-pushable';
import { fromString } from 'uint8arrays';

import { lpStream } from 'it-length-prefixed-stream'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { peerIdFromString } from '@libp2p/peer-id'
import last from 'it-last'
import { multiaddr } from '@multiformats/multiaddr'
import StreamHandler from './StreamHandler.js';
import Gun from 'gun';
import http from 'http'
const REQ_RESP_PROTOCOL = '/test-message-proto/1.0.0'

const streamHandler = new StreamHandler();

 const server = http.createServer().listen(8100);
 const gun = new Gun({web: server})
// the relay server listens on a transport dialable by the listener and the
// dialer, and has a relay service configured
const relay = await createLibp2p({
    addresses: {
        listen: ['/ip4/127.0.0.1/tcp/0/ws']
    },
    transports: [
        webSockets()
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
        denyDialMultiaddr: () => false
    },
    services: {
        identify: identify(),
        relay: circuitRelayServer(),
        ping: ping(),
        dht: kadDHT(
              {protocol: '/ipfs/kad/1.0.0', peerInfoMapper: removePrivateAddressesMapper}
        )
    }
});
// the listener has a WebSocket transport to dial the relay, a Circuit Relay
// transport to make a reservation, and a WebRTC transport to accept incoming
// WebRTC connections
relay.start();
console.log(relay.getMultiaddrs())
const listener = await createLibp2p({
    addresses: {
        listen: [
            '/p2p-circuit',
            '/webrtc'
        ]
    },
    transports: [
        webSockets(),
        webRTC(),
        circuitRelayTransport()
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
        denyDialMultiaddr: () => false
    }, 
    contentRouters: [
            kadDHT()
        ],
    services: {
        identify: identify(),
        echo: echo(),
        ping: ping(),
        dht: kadDHT(
               {protocol: '/ipfs/kad/1.0.0', peerInfoMapper: removePrivateAddressesMapper}
        )
    }
});
// the listener dials the relay (or discovers a public relay via some other
// method), important for hole punching in NAT-wall casse
await listener.dial(relay.getMultiaddrs(), {
    signal: AbortSignal.timeout(5000)
});
let webRTCMultiaddr;
// wait for the listener to make a reservation on the relay
while (true) {
    webRTCMultiaddr = listener.getMultiaddrs().find(ma => WebRTC.matches(ma));
    if (webRTCMultiaddr != null) {
        break;
    }
    // try again later
    await delay(1000);
}


await listener.handle(REQ_RESP_PROTOCOL, ({ stream }) => {
  Promise.resolve().then(async () => {
    // lpStream to read/write in a predetermined order for synced messages
    const lp = lpStream(stream)
    
     while (true) {
        // Read the incoming request
        const req = await lp.read();
        if (!req) {
            // stream has been closed, break the loop
            console.log('stream stopped')
            break;
        }
        // console.log(req)
        // Process the request
        // req.subArray is important af or it wont read the uint field in protobuf
        const message = new TextDecoder().decode(fromString(req.subarray()));

        // Construct a response
        const res = { reply: `You sent: ${message}` };
        console.log(res)
        // Send the response back
        await lp.write(new TextEncoder().encode(JSON.stringify(res)));
    }
  })
})
// second listener node

// const listener2 = await createLibp2p({
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
//     contentRouters: [
//             kadDHT()
//         ],
//     services: {
//         identify: identify(),
//         echo: echo(),
//         ping: ping(),
//         dht: kadDHT(
//                {protocol: '/custom/kad/1.0.0', peerInfoMapper: removePrivateAddressesMapper}
//         )
//     }
// });
// // the listener dials the relay (or discovers a public relay via some other
// // method), important for hole punching in NAT-wall casse
// await listener2.dial(relay.getMultiaddrs(), {
//     signal: AbortSignal.timeout(5000)
// });
// let webRTCMultiaddr2;
// // wait for the listener to make a reservation on the relay
// while (true) {
//     webRTCMultiaddr2 = listener2.getMultiaddrs().find(ma => WebRTC.matches(ma));
//     if (webRTCMultiaddr2 != null) {
//         break;
//     }
//     // try again later
//     await delay(1000);
// }


// // console.log(webRTCMultiaddr)
// await listener2.handle(REQ_RESP_PROTOCOL, ({connection, stream, protocol }) => {
//   Promise.resolve().then(async () => {
//     // lpStream to read/write in a predetermined order for synced messages
//     const lp = lpStream(stream)
//     console.log(listener2.peerId)
//     let peerID = connection.remoteAddr
//     console.log(multiaddr(peerID).getPeerId())



//      while (true) {
//         // Read the incoming request
//         const req = await lp.read();
//         if (!req) {
//             // stream has been closed, break the loop
//             console.log('stream stopped')
//             break;
//         }
//         // console.log(req)
//         // Process the request
//         // req.subArray is important af or it wont read the uint field in protobuf
//         const message = new TextDecoder().decode(fromString(req.subarray()));

//         // Construct a response
//         const res = { reply: `You sent: ${message}` };
//         console.log(res)
//         // Send the response back
//         await lp.write(new TextEncoder().encode(JSON.stringify(res)));
//     }



//   })
// })
// the dialer has Circuit Relay, WebSocket and WebRTC transports to dial
// the listener via the relay, complete the SDP handshake and establish a
// direct WebRTC connection to start duplex streams even behind NAT-wall using holepunching of relay server
const dialer = await createLibp2p({
    transports: [
        webSockets(),
        webRTC(),
        circuitRelayTransport()
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
        denyDialMultiaddr: () => false
    },
    services: {
        identify: identify(),
        echo: echo(),
        ping: ping(),
        dht: kadDHT(
        {protocol: '/ipfs/kad/1.0.0', peerInfoMapper: removePrivateAddressesMapper}
        )
    }
});
// const input = pushable();
// dial the listener to open up custom shit ass protocol
const stream = await dialer.dialProtocol(webRTCMultiaddr, REQ_RESP_PROTOCOL, {
    signal: AbortSignal.timeout(5000),
});

// const stream2 = await dialer.dialProtocol(webRTCMultiaddr2, REQ_RESP_PROTOCOL, {
//     signal: AbortSignal.timeout(5000)
// });
console.log(dialer.peerId)
// const maddr = multiaddr('/ip4/127.0.0.1/tcp/22033/ws/p2p/12D3KooWSQJhnWukc5dU1S1UhNkCY5UCdEYxCQxZQNUoSPEjYxBi/p2p-circuit/p2p/12D3KooW9toBCQSZCJKj6xzsW8MbBeqt8udfKS6SHzLFFivQYKEq')
// await listener.dial(maddr)

// // console.log(listener.getPeers())
// const peerId = peerIdFromString('12D3KooW9toBCQSZCJKj6xzsW8MbBeqt8udfKS6SHzLFFivQYKEq')
// const peerInfo = await listener.peerRouting.findPeer(peerId)
// console.log(peerInfo)
// const info = await listener.services.dht.put(fromString('key1'), fromString('value1'))
// console.log(info)
// // const nodeInfo = await dialer.services.dht.setMode('server')
// // await listener.services.dht.setMode('server')
// const val = await info.next()
// console.log(val)
// // console.log('Node Info:', nodeInfo)
// // async function testMultipleKeys() {
// //   // Try with different keys
//    dialer.services.dht.put(fromString('key1'), fromString('value1'));
// //   const final = await last(info);
// // //   for await(let item of info){
// // //     console.log(item)
// // //   }
// //   console.log(final)
// //    dialer.services.dht.put(fromString('key2'), fromString('value2'));
// //   console.log('Multiple puts done.');
// const result3= listener.services.dht.getClosestPeers(fromString('key1'))
//   // Verify each key
//   const result1 =  listener.services.dht.get(fromString('key1'));
//   const result2 =  listener.services.dht.get(fromString('key2'));

//   // Log results
// for await (const event of listener.services.dht.put(fromString('key1'), fromString('value1'))) {
//   console.info(event);
// }
// for await (const event of listener.services.dht.get(fromString('key1'))) {
//   console.info(event);
// }
//     for await (const item of result3) {
//     console.log('peers:', item);
//   }
//   console.log('peers done')
//   for await (const item of result1) {
//     console.log('Key1:', item);
//   }
//   for await (const item of result2) {
//     console.log('Key2:', item);
//   }
// }

// testMultipleKeys();

//  dialer.services.dht.put(fromString('ipv4'), fromString('test'))
// //  await new Promise(resolve => setTimeout(resolve, 10000)); 
// let val =  listener.services.dht.get(fromString('ipv4'))
// // console.log(val)
// const extractDHTValue = async (res) => {
//     let finalValue = null;
//     for await (const item of res) {
//     console.log(item);  // This will log each item in the iterable
//   }
//     // for await (const event of res) {
//     //     if (event.name === 'VALUE' && event.record) {
//     //         // Extract the value from the record
//     //         const value = toString(event.record.value);
//     //         console.log('DHT Record Value:', value);
//     //         finalValue = value;
//     //     }
//     // }

//     // if (finalValue === null) {
//     //     console.log('No value found in the DHT query response.');
//     // }

//     return finalValue;
// };
// // const extractDHTValue = async (res) => {
   
// //     let final_res = await last(res);
    
// //     let finalValue = final_res.value;
// //     // Will get a Uint8Array 
// //     // parse it back to string using to `toString` from `uint8arrays`
    
// //     return toString(finalValue);
// // };
// const res = await extractDHTValue(val);
// console.log(res);


// const lp = lpStream(stream)
// const lp2 = lpStream(stream2)
streamHandler.addStream(1,stream)
// streamHandler.addStream(2,stream2)

for (let i = 0; i < 3; i++) {

//   await lp.write(new TextEncoder().encode(`${i}`))
  await streamHandler.writeToStream(1, `${i}`);
   console.log(i)
//   console.log(i)
  
}
await new Promise(resolve => setTimeout(resolve, 100000));

// Now run the second writeToStream after the delay
await streamHandler.writeToStream(1, 'Delayed message');
console.log('Second writeToStream executed after 10 seconds');

// for (let i = 0; i < 3; i++) {

// //   await lp2.write(new TextEncoder().encode(`${i}`))
//     await streamHandler.writeToStream(2, `${i}`);
//    console.log(i)
// //   console.log(i)
  
// }
while(true){
    //   const res = await lp.read();
    //   const res = await streamHandler.readFromStream(1)
    //   console.log(new TextDecoder().decode(res.subarray()))
    // const response = JSON.parse(new TextDecoder().decode(res.subarray()));
  
    // console.log(`Received response:`, res);
        //  const res2 = await lp2.read();
        //  const res2 = await streamHandler.readFromStream(2)
         const response = await streamHandler.readFromAllStreams();
         console.log(response)
    //   console.log(new TextDecoder().decode(res.subarray()))
    // const response2 = JSON.parse(new TextDecoder().decode(res2.subarray()));
  
    // console.log(`Received response:`, res2);
}








// so separate reads work as long as from same lpStream instance and always active

// this iteration of lpStream on custom protocol with webrtc-direct works in sending res-req, 
// now i have to add api support for accepting data for lp.writes 