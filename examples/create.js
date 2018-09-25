const lsl = require('../index');
const numChannels = 3;
const info = lsl.create_streaminfo(
    'Dummy',
    'EEG',
    numChannels,
    100, // Sample rate
    lsl.channel_format_t.cft_float32,
    'Dummy EEG Device',
);
const desc = lsl.get_desc(info);
console.log('desc', desc);
lsl.append_child_value(desc, 'manufacturer', 'Random Inc.');
const channels = lsl.append_child(desc, 'channels');
for (let i = 0; i < numChannels; i++) {
    const channel = lsl.append_child(channels, 'channel');
    lsl.append_child_value(channel, 'label', 'Channel ' + i);
    lsl.append_child_value(channel, 'unit', 'microvolts');
    lsl.append_child_value(channel, 'type', 'EEG');
}

const outlet = lsl.create_outlet(info, 0, 360);
setInterval(function() {
    const samples = [];
    for (i = 0; i < numChannels; i++) {
        samples.push(Math.random());
    }
    lsl.push_sample_ft(outlet, new lsl.FloatArray(samples), lsl.local_clock());
}, 10);
