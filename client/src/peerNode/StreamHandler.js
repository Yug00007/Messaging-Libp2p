import { lpStream } from 'it-length-prefixed-stream'
import {byteStream} from 'it-byte-stream'
// import { byteStream } from 'it-byte-stream'

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


class StreamHandler{
  constructor(){
    this.streams = {}; // Use an object to map stream IDs to streams
  }

  // Add a new stream with a unique identifier
  addStream(streamId, stream){
    const lp = lpStream(stream) // Initialize the stream
    this.streams[streamId] = lp; // Map the stream to the streamId
  }
  stopStream(stream){
    let unwrappedStream = stream.unwrap()
    if(unwrappedStream && unwrappedStream.duplexStream) console.log('can be destroyed')
    // UnwrappedStream.closeWrite();
  if(unwrappedStream!=undefined) console.log('atleast stream exists')



  // console.log(unwrappedStream); // This was to check read-write status earlier. Uncomment when debugging read write status of stream




    // const UnwrappedStream= wrappedStream.unwrap();
    //closing unwrapped stream by close() from AbstractStream class's utils. To destroy stream when no Bytes left to read.
    unwrappedStream.close({signal: AbortSignal.timeout(400)})

    // deleting stream from Object map to avoid garbage values
      const streamID = Object.keys(this.streams).find(key => this.streams[key] === stream);
      if (streamID) {
        console.log(`Removing streamID: ${streamID}`);
        delete this.streams[streamID];  // Removed the stream from the object
      }
    // console.log('closed stream')
  }

  // Write to a specific stream based on the streamId
  async writeToStream(streamId, data){
    if (this.streams[streamId]) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
      await this.streams[streamId].write(new TextEncoder().encode(data));
      return console.log(`Data written to stream ${streamId}: ${data}`);
    } else {
      throw new Error('no stream')
      // return console.log(`Stream not found.`);
    }
  }

  // Write to all streams
//   async writeToAllStreams(data) {
//     for (const streamId in this.streams) {
//       await this.streams[streamId].write(new TextEncoder().encode(data));
//      return  console.log(`Data written to stream ${streamId}: ${data}`);
//     }
//   }

  // Read from a specific stream based on the streamId
  async readFromStream(streamId){
    if (this.streams[streamId]) {
      const res = await this.streams[streamId].read();
      return JSON.parse(new TextDecoder().decode(res.subarray()));
    } else {
      console.log(`Stream with ID ${streamId} not found.`);
      return null;
    }
  }

  // Read from all streams concurrently
  async readFromAllStreams(){
    // let exitFlag =0;
    // while(true){
    const readPromises = Object.values(this.streams).map(async (stream) => {
      console.log("reading...")
      if(!stream || stream == undefined){ console.log('stream closed'); return;}
      // console.log(stream.status)
      
    try {
      const res = await stream.read({signal: AbortSignal.timeout(5000)});
      if(res==undefined|| !res){ console.log('undefined data'); return;}
      else{
        const f1 = new TextDecoder().decode(res.subarray())
        // console.log(f1)
        if (typeof f1 === 'object') { // this does nothing btw, as f1 will always be string. so format it for some json string use case shit
            const fres= JSON.parse(f1);
            return fres;
        }
        const fres = f1
        console.log(fres)
        if(fres[0]==undefined || fres == undefined ) console.log('undefined fres in read all stream func')
        return fres;
      }

    } catch (error) {
      // console.log("reading issue in streamHandler", error)
      console.log('readFromAllstream is stopping stream')
      // console.log(error)
      await timeout(1000)
      this.stopStream(stream);
      
    }
    
    });
    // if(exitFlag==1) break;
    return await Promise.all(readPromises);
    //  }
  }

//   async *readFromAllStreams() {
//   // Iterate through the streams in this.streams
//   for (let stream of Object.values(this.streams)) {
//     if (stream === undefined) {
//       console.log('Stream closed');
//       continue;  // Skip this iteration if the stream is undefined
//     }

//     try {
//       console.log("Reading from stream...");
//       // Attempt to read from the stream with a timeout
//       const res = await stream.read();

//       // Decode and parse the result
//       const fres = JSON.parse(new TextDecoder().decode(res.subarray()));

//       // Yield the result asynchronously
//       yield fres;
//     } catch (err) {
//       console.error('Error reading from stream:', err);
//     }
//   }
// }

}
export default StreamHandler;
