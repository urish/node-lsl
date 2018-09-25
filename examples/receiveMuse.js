const lsl = require('..');
const ref = require('ref');

const LSL_CHUNK = 12; // Chunk size.
const LSL_BUFFER = 360; // Buffer length.

// Resolve an LSL stream with type='EEG'
const streams = lsl.resolve_byprop('type', 'EEG');

console.log('Resolved ', streams.length, ' streams of EEG');

console.log(streams[0].getChannelCount());

// console.log('Connecting...');
// streamInlet = new lsl.StreamInlet(streams[0]);
// streamInlet.on('chunk:', console.log);
// streamInlet.on('closed', console.log);
// streamInlet.streamChunks();

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
