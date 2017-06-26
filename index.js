const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
const ArrayType = require('ref-array');

const streamInfo = ref.refType(ref.types.void);
const xmlPtr = ref.refType(ref.types.void);
const outletType = ref.refType(ref.types.void);
const FloatArray = ArrayType(ref.types.float);

const channel_format_t = {
    cft_undefined: 0,
    cft_float32: 1,
    cft_double64: 2,
    cft_string: 3,
    cft_int32: 4,
    cft_int16: 5,
    cft_int8: 6,
    cft_int64: 7,
}

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
    x64: 'liblsl64'
}

const libName = architectures[process.arch];
if (!libName) {
    throw new Error(`Unsupported CPU architecture for node-lsl: ${process.arch}`);
}

const lsl = ffi.Library(path.join(__dirname, 'prebuilt', libName), {
    'lsl_protocol_version': ['int', []],
    'lsl_library_version': ['int', []],
    'lsl_create_streaminfo': [streamInfo, ['string', 'string', 'int', 'double', 'int', 'string']],
    'lsl_destroy_streaminfo': ['void', [streamInfo]],
    'lsl_copy_streaminfo': [streamInfo, [streamInfo]],
    'lsl_get_desc': [xmlPtr, [streamInfo]],
    'lsl_append_child_value': ['void', [xmlPtr, 'string', 'string']],
    'lsl_append_child': [xmlPtr, [xmlPtr, 'string']],
    'lsl_create_outlet': [outletType, [streamInfo, 'int', 'int']],
    'lsl_local_clock': ['double', []],
    'lsl_push_sample_f': ['int', [outletType, FloatArray]],
    'lsl_push_sample_ft': ['int', [outletType, FloatArray, 'double']],
    'lsl_destroy_outlet': ['void', [outletType]],
});

module.exports = {
    channel_format_t,
    error_code_t,
    FloatArray,
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
};
