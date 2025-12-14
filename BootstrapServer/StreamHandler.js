import { lpStream } from 'it-length-prefixed-stream'
class StreamHandler {
  constructor() {
    this.streams = {}; // Use an object to map stream IDs to streams
  }

  // Add a new stream with a unique identifier
  addStream(streamId, stream) {
    const lp = lpStream(stream); // Initialize the stream
    this.streams[streamId] = lp; // Map the stream to the streamId
  }

  // Write to a specific stream based on the streamId
  async writeToStream(streamId, data) {
    if (this.streams[streamId]) {
      await this.streams[streamId].write(new TextEncoder().encode(data));
    //   return console.log(`Data written to stream ${streamId}: ${data}`);
    } else {
    //   return console.log(`Stream not found.`);
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
  async readFromStream(streamId) {
    if (this.streams[streamId]) {
      const res = await this.streams[streamId].read();
      return JSON.parse(new TextDecoder().decode(res.subarray()));
    } else {
      console.log(`Stream with ID ${streamId} not found.`);
      return null;
    }
  }

  // Read from all streams concurrently
  async readFromAllStreams() {
    const readPromises = Object.values(this.streams).map(async (stream) => {
      const res = await stream.read();
      return JSON.parse(new TextDecoder().decode(res.subarray()));
    });

    return await Promise.all(readPromises);
  }
}
export default StreamHandler;
