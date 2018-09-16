const lsl = require('./index');
const EventEmitter = require('events');
const ref = require('ref');

/**
 * Creates an instance of the stream inlet object.
 * @constructor
 * @name StreamInlet
 * @param ...
 */
class StreamInlet extends EventEmitter {
    constructor(stream, max_buflen = 360, max_chunklen = 0, recover = 1) {
        super();
        this.max_buflen = max_buflen;
        this.max_chunklen = max_chunklen;
        this.recover = recover;
        this.isStreaming = false;

        this.inlet = lsl.create_inlet(stream, this.max_buflen, this.max_chunklen, this.recover);
    }

    streamChunks(timeout = 10) {
        this.isStreaming = true;
        this.timeout = timeout;
        this.errCode = 0;
        let sampleBuffer = new lsl.FloatArray(this.max_buflen); // Not sure how we should set the size of this thing. Look to C# wrapper for ideas
        let timestampBuffer = new lsl.DoubleArray(this.max_buflen);
        try {
            while (this.isStreaming) {
                const samps = lsl.pull_chunk(
                    this.inlet,
                    sampleBuffer,
                    timestampBuffer,
                    sampleBuffer.length,
                    timestampBuffer.length,
                    this.timeout,
                    this.errCode,
                );
                console.log('pulled ', samps);
                this.emit('chunk', { samples: sampleBuffer.toJSON(), timestamps: timestampBuffer.toJSON() });
            }
        } catch (e) {
            console.error(e);
            this.close();
        }
    }

    close() {
        this.isStreaming = false;
        this.emit('closed');
    }

    getIsStreaming() {
        return this.isStreaming;
    }
}

module.exports = StreamInlet;
