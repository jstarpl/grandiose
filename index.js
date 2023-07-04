/* Copyright 2018 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const path = require("path")

const addon = isSupportedPlatform()
  ? require('bindings')({
    bindings: "grandiose",
    module_root: path.resolve(__dirname)
  })
  : {
    version () { return null },
    isSupportedCPU () { return false },
    initialize () { return null },
    destroy () { return null },
    send () { return null },
    receive () { return null },
    routing () { return null },
    find: { apply () { return null } }
  }

const NDI_LIB_FOURCC = (ch0, ch1, ch2, ch3) =>
	(ch0.charCodeAt(0) | (ch1.charCodeAt(0) << 8) | (ch2.charCodeAt(0) << 16) | (ch3.charCodeAt(0) << 24))

const FOURCC_UYVY = NDI_LIB_FOURCC("U", "Y", "V", "Y")
const FOURCC_UYVA = NDI_LIB_FOURCC("U", "Y", "V", "A")
const FOURCC_P216 = NDI_LIB_FOURCC("P", "2", "1", "6")
const FOURCC_PA16 = NDI_LIB_FOURCC("P", "A", "1", "6")
const FOURCC_YV12 = NDI_LIB_FOURCC("Y", "V", "1", "2")
const FOURCC_I420 = NDI_LIB_FOURCC("I", "4", "2", "0")
const FOURCC_NV12 = NDI_LIB_FOURCC("N", "V", "1", "2")
const FOURCC_BGRA = NDI_LIB_FOURCC("B", "G", "R", "A")
const FOURCC_BGRX = NDI_LIB_FOURCC("B", "G", "R", "X")
const FOURCC_RGBA = NDI_LIB_FOURCC("R", "G", "B", "A")
const FOURCC_RGBX = NDI_LIB_FOURCC("R", "G", "B", "X")
const FOURCC_FLTp = NDI_LIB_FOURCC("F", "L", "T", "p")

class FourCC {
  UYVY = FOURCC_UYVY;
  UYVA = FOURCC_UYVA;
  P216 = FOURCC_P216;
  PA16 = FOURCC_PA16;
  YV12 = FOURCC_YV12;
  I420 = FOURCC_I420;
  NV12 = FOURCC_NV12;
  BGRA = FOURCC_BGRA;
  BGRX = FOURCC_BGRX;
  RGBA = FOURCC_RGBA;
  RGBX = FOURCC_RGBX;
  FLTp = FOURCC_FLTp;
}

class ColorFormat {
  BGRX_BGRA = 0; // No alpha channel: BGRX, Alpha channel: BGRA
  UYVY_BGRA = 1; // No alpha channel: UYVY, Alpha channel: BGRA
  RGBX_RGBA = 2; // No alpha channel: RGBX, Alpha channel: RGBA
  UYVY_RGBA = 3; // No alpha channel: UYVY, Alpha channel: RGBA
  Fastest = 100;
  Best = 101;

  // On Windows there are some APIs that require bottom to top images in RGBA format. Specifying
  // this format will return images in this format. The image data pointer will still point to the
  // "top" of the image, althought he stride will be negative. You can get the "bottom" line of the image
  // using : video_data.p_data + (video_data.yres - 1)*video_data.line_stride_in_bytes
  BGRX_BGRA_FLIPPED = 200;
}

class Bandwidth {
  MetadataOnly = -10; // Receive metadata.
  AudioOnly = 10; // Receive metadata, audio.
  Lowest = 0; // Receive metadata, audio, video at a lower bandwidth and resolution.
  Highest = 100; // Receive metadata, audio, video at full resolution.
}

class FrameType {
  Progressive = 1;
  Interlaced = 0;
  Field0 = 2;
  Field1 = 3;
}

class AudioFormat {
  // Default NDI audio format
  // Channels stored one after the other in each block - 32-bit floating point values
  Float32Separate = 0;
  // Alternative NDI audio foramt
  // Channels stored as channel-interleaved 32-bit floating point values
  Float32Interleaved = 1;
  // Alternative NDI audio format
  // Channels stored as channel-interleaved 16-bit integer values
  Int16Interleaved = 2;
}

let find = function (...args) {
  if (args.length === 0) return addon.find();
  if (Array.isArray(args[0].groups)) {
    args[0].groups = args[0].groups.reduce((x, y) => x + ',' + y);
  }
  if (Array.isArray(args[0].extraIPs)) {
    args[0].extraIPs = args[0].extraIPs.reduce((x, y) => x + ',' + y);
  }
  return addon.find.apply(null, args);
}

function isSupportedPlatform () {
  return process.platform === 'darwin' || process.platform === 'linux' ||
    (process.platform === 'win32' && ['ia32', 'x64'].includes(process.arch))
}

module.exports = {
  version: addon.version,
  isSupportedCPU: addon.isSupportedCPU,
  initialize: addon.initialize,
  destroy: addon.destroy,
  find: find,
  receive: addon.receive,
  send: addon.send,
  routing: addon.routing,
  ColorFormat,
  FrameType,
  FourCC,
  Bandwidth,
};
