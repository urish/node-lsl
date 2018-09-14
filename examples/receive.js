const lsl = require('../index');

let buf = Buffer.alloc(10);

lsl.resolve_byprop(buf, 10, 'type', 'EEG', 1, 10);

console.log('done resolving');
