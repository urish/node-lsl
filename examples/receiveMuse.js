const lsl = require('../index');
const ref = require('ref');

const LSL_CHUNK = 12; // Chunk size.
const LSL_BUFFER = 360; // Buffer length.

// Resolve an LSL stream with type='EEG'
const streams = lsl.resolve_byprop('type', 'EEG');

console.log('Resolved ', streams.length, ' streams of EEG: ', streams.map((info) => info.getName()));

console.log('Connecting...');
streamInlet = new lsl.StreamInlet(streams[0]);
streamInlet.streamChunks(LSL_CHUNK);
streamInlet.on('chunk', (dataObject) => console.log(dataObject.data));
streamInlet.on('closed', console.log);
