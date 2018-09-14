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

describe('create_streaminfo', () => {
    it('should create some lsl stream', () => {
        const info = lsl.create_streaminfo('Muse', 'EEG', 5, 256, lsl.channel_format_t.cft_float32, 'dummy');
        expect(info).toBeInstanceOf(Buffer);
    });
});

describe('create_outlet', () => {
    it('should create some lsl stream', () => {
        const info = lsl.create_streaminfo('Muse', 'EEG', 5, 256, lsl.channel_format_t.cft_float32, '');
        const outlet = lsl.create_outlet(info, 10, 100);
        expect(outlet).toBeInstanceOf(Buffer);
    });
});

describe('push_sample_f', () => {
    it('should return success code', () => {
        const info = lsl.create_streaminfo('Muse', 'EEG', 5, 256, lsl.channel_format_t.cft_float32, '');
        const outlet = lsl.create_outlet(info, 10, 100);
        const result = lsl.push_sample_f(outlet, new lsl.FloatArray([1, 2, 3, 3, 4]));
        expect(result).toBe(lsl.error_code_t.no_error);
    });
});

describe('push_sample_ft', () => {
    it('should return success code', () => {
        const info = lsl.create_streaminfo('Muse', 'EEG', 5, 256, lsl.channel_format_t.cft_float32, '');
        const outlet = lsl.create_outlet(info, 10, 100);
        const result = lsl.push_sample_ft(outlet, new lsl.FloatArray([0.5, 0.5, 0.5, 0.5, 0.5]), 50);
        expect(result).toBe(lsl.error_code_t.no_error);
    });
});
