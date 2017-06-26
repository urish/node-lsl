const lsl = require('./index');
const os = require('os');

describe('library_version', () => {
    it('should return library version', () => {
        if (os.platform() === 'win32') {
            expect(lsl.library_version()).toEqual(112);
        } else {
            expect(lsl.library_version()).toEqual(110);
        }
    });
});

describe('protocol_version', () => {
    it('should return protocol version', () => {
        expect(lsl.protocol_version()).toEqual(110);
    });
});

describe('local_clock', () => {
    it('should return a number', () => {
        expect(lsl.local_clock()).toEqual(expect.any(Number));
    });
});
