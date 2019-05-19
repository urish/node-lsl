# node-lsl

[Lab stream layer (LSL)](https://github.com/sccn/labstreaminglayer) bindings for node.js.

[![Build Status](https://travis-ci.org/urish/node-lsl.png?branch=master)](https://travis-ci.org/urish/node-lsl)

Not all functions are currently available - pull requests are welcome (please also include a [relevant test](index.spec.js)).

## Usage examples:

### Sending data

```javascript
const lsl = require('node-lsl');
const numChannels = 3;
const info = lsl.create_streaminfo("Dummy", "EEG", numChannels, 100, lsl.channel_format_t.cft_float32, "Dummy EEG Device");
const desc = lsl.get_desc(info);
lsl.append_child_value(desc, "manufacturer", "Random Inc.");
const channels = lsl.append_child(desc, "channels");
for (let i = 0; i < numChannels; i++) {
    const channel = lsl.append_child(channels, "channel");
    lsl.append_child_value(channel, "label", "Channel " + i);
    lsl.append_child_value(channel, "unit", "microvolts");
    lsl.append_child_value(channel, "type", "EEG");
}

const outlet = lsl.create_outlet(info, 0, 360);
setInterval(function() {
    const samples = [];
    for (i = 0; i < numChannels; i++) {
        samples.push(Math.random());
    }
    lsl.push_sample_ft(outlet, new lsl.FloatArray(samples), lsl.local_clock());
}, 10);
```
### Receiving data

```javascript
const lsl = require('node-lsl');
const streams = lsl.resolve_byprop('type', 'EEG');

streamInlet = new lsl.StreamInlet(streams[0]);
streamInlet.streamChunks(12, 1000);
streamInlet.on('chunk', console.log);
streamInlet.on('closed', () => console.log('LSL inlet closed'));
```
