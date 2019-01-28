const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
const ArrayType = require('ref-array');
const EventEmitter = require('events');

const streamInfo = ref.refType(ref.types.void);
const xmlPtr = ref.refType(ref.types.void);
const outletType = ref.refType(ref.types.void);
const FloatArray = ArrayType(ref.types.float);
const DoubleArray = ArrayType(ref.types.double);
const buffer = ref.refType(ref.types.void);
const inletType = ref.refType(ref.types.void);

const channel_format_t = {
    cft_undefined: 0,
    cft_float32: 1,
    cft_double64: 2,
    cft_string: 3,
    cft_int32: 4,
    cft_int16: 5,
    cft_int8: 6,
    cft_int64: 7,
};

const error_code_t = {
    no_error: 0,
    timeout_error: -1,
    lost_error: -2,
    argument_error: -3,
    internal_error: -4,
};

const architectures = {
    x86: 'liblsl32',
    ia32: 'liblsl32',
    x64: 'liblsl64',
};

const libName = architectures[process.arch];
if (!libName) {
    throw new Error(`Unsupported CPU architecture for node-lsl: ${process.arch}`);
}

const lsl = ffi.Library(path.join(__dirname, 'prebuilt', libName), {
    lsl_protocol_version: ['int', []],
    lsl_library_version: ['int', []],
    lsl_create_streaminfo: [streamInfo, ['string', 'string', 'int', 'double', 'int', 'string']],
    lsl_destroy_streaminfo: ['void', [streamInfo]],
    lsl_copy_streaminfo: [streamInfo, [streamInfo]],
    lsl_get_name: ['string', [streamInfo]],
    lsl_get_channel_count: ['int', [streamInfo]],
    lsl_get_type: ['string', [streamInfo]],
    lsl_get_nominal_srate: ['double', [streamInfo]],
    lsl_get_channel_format: ['int', [streamInfo]],
    lsl_get_desc: [xmlPtr, [streamInfo]],
    lsl_append_child_value: ['void', [xmlPtr, 'string', 'string']],
    lsl_append_child: [xmlPtr, [xmlPtr, 'string']],
    lsl_create_outlet: [outletType, [streamInfo, 'int', 'int']],
    lsl_local_clock: ['double', []],
    lsl_push_sample_f: ['int', [outletType, FloatArray]],
    lsl_push_sample_ft: ['int', [outletType, FloatArray, 'double']],
    lsl_destroy_outlet: ['void', [outletType]],
    lsl_resolve_byprop: ['int', [buffer, 'int', 'string', 'string', 'int', 'double']],
    lsl_create_inlet: [inletType, [streamInfo, 'int', 'int', 'int']],
    lsl_pull_chunk_f: ['ulong', [inletType, FloatArray, DoubleArray, 'ulong', 'ulong', 'double', 'int']],
});

const resolve_byprop = (prop, value, min = 1, timeout = 10) => {
    const buf = Buffer.alloc(1024);
    const numStreams = lsl.lsl_resolve_byprop(buf, 1024, prop, value, min, timeout);
    const streams = [];
    for (let i = 0; i < numStreams; i++) {
        streams.push(new StreamInfo(ref.readPointer(buf, i)));
    }
    return streams;
};

/** A class that stores the declaration of a data stream
 * @constructor
 * @name StreamInfo
 * @param ...
 */

class StreamInfo {
    constructor(
        handle = null,
        name = 'untitled',
        type = '',
        channelCount = 1,
        nominalSrate = 0,
        channelFormat = channel_format_t.cft_float32,
        sourceID = '',
    ) {
        if (handle !== null) {
            this.object = handle; //Might need to copy ref
        } else {
            this.object = lsl.lsl_create_streaminfo(name, type, channelCount, nominalSrate, channelFormat, sourceID);
        }
    }

    getName() {
        return lsl.lsl_get_name(this.object);
    }

    getChannelCount() {
        return lsl.lsl_get_channel_count(this.object);
    }

    getType() {
        return lsl.lsl_get_type(this.object);
    }

    getNominalSamplingRate() {
        return lsl.lsl_get_nominal_srate(this.object);
    }

    getChannelFormat() {
        return Object.entries(channel_format_t)[lsl.lsl_get_channel_format(this.object)];
    }
}

/**
 * A stream inlet. Inlets are used to receive streaming data (and meta-data) from the network.
 * @constructor
 * @name StreamInlet
 * @param ...
 */
class StreamInlet extends EventEmitter {
    constructor(info, maxBuflen = 360, maxChunklen = 0, recover = 1) {
        super();
        this.maxBuflen = maxBuflen;
        this.maxChunklen = maxChunklen;
        this.recover = recover;
        this.isStreaming = false;
        this.inlet = lsl.lsl_create_inlet(info.object, this.maxBuflen, this.maxChunklen, this.recover);
        this.channelCount = info.getChannelCount();
        this.channelFormat = info.getChannelFormat();
        this.samplingRate = info.getNominalSamplingRate();
    }

    pullChunk(timeout = 0.0, maxSamples = 1024) {
        const sampleBuffer = new FloatArray(maxSamples * this.channelCount);
        const timestampBuffer = new DoubleArray(maxSamples);
        const samples = lsl.lsl_pull_chunk_f(
            this.inlet,
            sampleBuffer,
            timestampBuffer,
            sampleBuffer.length,
            timestampBuffer.length,
            timeout,
            0,
        );
        return { samples: sampleBuffer.toJSON(), timestamps: timestampBuffer.toJSON() };
    }

    // Note: interval is derived from samplingRate and chunk size
    streamChunks(chunkSize, timeout = 0.0, maxSamples = chunkSize * 1.5, errCode = 0) {
        const timerInterval = (1000 / this.samplingRate) * chunkSize;
        const sampleBuffer = new FloatArray(maxSamples * this.channelCount);
        const timestampBuffer = new DoubleArray(maxSamples);
        let samples = 0;
        const read = () => {
            process.nextTick(() => {
                if (this.isStreaming) {
                    samples = lsl.lsl_pull_chunk_f(
                        this.inlet,
                        sampleBuffer,
                        timestampBuffer,
                        sampleBuffer.length,
                        timestampBuffer.length,
                        timeout,
                        errCode,
                    );
                    this.emit('chunk', {
                        data: this._parseSampleBuffer(sampleBuffer.toJSON(), samples),
                        timestamps: timestampBuffer.toJSON().slice(0, samples / this.channelCount),
                    });
                }
            });
        };
        try {
            this.isStreaming = true;
            this.interval = setInterval(read, timerInterval);
        } catch (e) {
            console.error(e);
            this.close();
        }
    }

    close() {
        this.isStreaming = false;
        clearInterval(this.interval);
        this.emit('closed');
    }

    getIsStreaming() {
        return this.isStreaming;
    }

    _parseSampleBuffer(sampleArray, samples) {
        let numSamples = samples / this.channelCount;
        let parsedArray = [];
        for (let i = 0; i < this.channelCount; i++) {
            let channelArray = new Array(numSamples).fill(NaN);
            for (let k = 0; k < numSamples; k++) {
                channelArray[k] = sampleArray[i + k * this.channelCount];
            }
            parsedArray.push(channelArray);
        }
        return parsedArray;
    }
}

module.exports = {
    channel_format_t,
    error_code_t,
    FloatArray,
    DoubleArray,
    protocol_version: lsl.lsl_protocol_version,
    library_version: lsl.lsl_library_version,
    local_clock: lsl.lsl_local_clock,
    create_streaminfo: lsl.lsl_create_streaminfo,
    destroy_streaminfo: lsl.lsl_destroy_streaminfo,
    copy_streaminfo: lsl.lsl_copy_streaminfo,
    get_desc: lsl.lsl_get_desc,
    append_child_value: lsl.lsl_append_child_value,
    append_child: lsl.lsl_append_child,
    create_outlet: lsl.lsl_create_outlet,
    push_sample_f: lsl.lsl_push_sample_f,
    push_sample_ft: lsl.lsl_push_sample_ft,
    destroy_outlet: lsl.lsl_destroy_outlet,
    resolve_byprop,
    create_inlet: lsl.lsl_create_inlet,
    pull_chunk_f: lsl.lsl_pull_chunk_f,
    StreamInlet,
    StreamInfo,
};
