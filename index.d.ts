type streamInfo = {};
type xmlPtr = {};
type outletType = {};
type streamInfoArray = {};
type buffer = {};

const channel_format_t: {
    cft_float32: number;
    cft_double64: number;
    cft_string: number;
    cft_int32: number;
    cft_int16: number;
    cft_int8: number;
    cft_int64: number;
    cft_undefined: number;
};

const error_code_t: {
    no_error: number;
    timeout_error: number;
    lost_error: number;
    argument_error: number;
    internal_error: number;
};

class FloatArray {
    constructor(values: number[]);
}

class DoubleArray {
    constructor(values: number[]);
}

function protocol_version(): number;
function library_version(): number;
function local_clock(): double;
function create_streaminfo(
    name: string,
    type: string,
    channel_count: number,
    nominal_srate: number,
    channel_format: number,
    source_id: string,
): streamInfo;
function lsl_destroy_streaminfo(stream: streamInfo): void;
function lsl_copy_streaminfo(stream: streamInfo): streamInfo;
function get_desc(stream: streamInfo): xmlPtr;
function append_child_value(e: xmlPtr, name: string, value: string): void {}
function append_child(e: xmlPtr, name: string): xmlPtr {}
function create_outlet(info: xmlPtr, chunk_size: number, max_buffered: number): outletType {}
function push_sample_f(out: outletType, data: FloatArray): number;
function push_sample_ft(out: outletType, data: FloatArray, timestamp: number): number;
function destroy_outlet(out: outletType): void;
function resolve_byprop(
    buffer: buffer,
    buffer_elements: number,
    prop: string,
    value: string,
    minimum: number,
    timeout: number,
): streamInfo;
function create_inlet(stream: streamInfo, max_buflen: number, max_chunklen: number, recover: number);
function pull_chunk_f(
    inlet: inletType,
    data_buffer: FloatArray,
    timestamp_buffer: DoubleArray,
    timeout: number,
    ec: number,
): number;
