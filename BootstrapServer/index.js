// imports for libp2p relay
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
// import { echo } from '@libp2p/echo';
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';
// import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import {kadDHT, removePrivateAddressesMapper} from '@libp2p/kad-dht'
import { ping } from '@libp2p/ping'
// import { multiaddr } from '@multiformats/multiaddr'
// import { pipe } from 'it-pipe';
import { createLibp2p } from 'libp2p';
// imports for GunServer to relay
import http from 'http';
// import Gun from 'gun';


const relay = await createLibp2p({
    addresses: {
        listen: ['/ip4/127.0.0.1/tcp/0/ws']
    },
    transports: [
        webSockets(),

    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
        denyDialMultiaddr: () => false
    },
    services: {
        identify: identify(),
        relay: circuitRelayServer(),
        // dht: kadDHT()
        // ping: ping(),

    }
});

let relayAddress = relay.getMultiaddrs()
// let relayAddress ='sdk'
// console.log(relay.peerId)
// console.log(relay.getMultiaddrs())
// console.log(relayAddress)
// here's relay for GUN-DB now

// const GunServer = http.createServer().listen(8080)
// // const server = require('http').createServer().listen(8080);
// const gun = Gun({web: GunServer});
export default relay