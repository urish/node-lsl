const lsl = require('../index');
const ref = require('ref');

// Resolve an LSL stream with type='EEG'
const streams = lsl.resolve_byprop('type', 'EEG');

console.log('Resolved ', streams.length, ' streams of EEG');

console.log('Connecting...');
streamInlet = new lsl.StreamInlet(streams[0]);
streamInlet.streamChunks(12, 1000);
streamInlet.on('chunk', console.log);
streamInlet.on('closed', console.log);
