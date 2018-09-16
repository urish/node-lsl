const lsl = require('../index');
const ref = require('ref');
const StreamInlet = require('../streamInlet');

// Resolve an LSL stream with type='EEG'
let buf = Buffer.alloc(1024);
const numStreams = lsl.resolve_byprop(buf, 1024, 'type', 'EEG', 1, 10);
console.log('resolved', numStreams, 'LSL streams');

// Add resolved streams to an array
const streams = [];
for (let i = 0; i < numStreams; i++) {
    streams.push(ref.readPointer(buf, i));
}

streamInlet = new StreamInlet(streams[0], 10, 5);
streamInlet.on('chunk', console.log);
streamInlet.on('closed', console.log);
streamInlet.streamChunks();

// // Open an inlet
// const chunkSize = 5;
// const bufferLength = 10;
// const inlet = lsl.create_inlet(streams[0], bufferLength, chunkSize, 1);
// console.log('created inlet');

// // Receive data
// const numChannels = 3;
// let sampleBuffer = new lsl.FloatArray(bufferLength * numChannels);
// let timestampBuffer = new lsl.DoubleArray(bufferLength);
// while (true) {
//     const samps = lsl.pull_chunk(
//         inlet,
//         sampleBuffer,
//         timestampBuffer,
//         sampleBuffer.length,
//         timestampBuffer.length,
//         10,
//         0,
//     );
//     console.log(
//         new Array(timestampBuffer.length).fill(0).map((_, i) => ({
//             data: sampleBuffer.slice(i * numChannels, i * numChannels + numChannels).toJSON(),
//             timestamp: timestampBuffer[i],
//         })),
//     );
// }
