export interface AudioFrame {
  type: 'audio'
  audioFormat: AudioFormat
  referenceLevel: number
  sampleRate: number // Hz
  channels: number
  samples: number
  channelStrideInBytes: number
  timestamp: [number, number] // PTP timestamp
  timecode: [number, number] // timecode as PTP value
  data: Buffer
}

export interface VideoFrame {
  type: 'video'
  xres: number
  yres: number
  frameRateN: number
  frameRateD: number
  fourCC: FourCC
  pictureAspectRatio: number
  timestamp: bigint // PTP timestamp
  frameFormatType: FrameType
  timecode: bigint // Measured in nanoseconds
  lineStrideBytes: number
  data: Buffer
}

export interface Receiver {
  embedded: unknown
  video: (timeout?: number) => Promise<VideoFrame>
  audio: (params: {
    audioFormat: AudioFormat
    referenceLevel: number
  }, timeout?: number) => Promise<AudioFrame>
  metadata: any
  data: any
  source: Source
  colorFormat: ColorFormat
  bandwidth: Bandwidth
  allowVideoFields: boolean
}

export interface Sender {
  embedded: unknown
  destroy: () => Promise<void>
  video: (frame: VideoFrame) => Promise<void>
  audio: (frame: AudioFrame) => Promise<void>
  name: string
  groups?: string | string[]
  clockVideo: boolean
  clockAudio: boolean
}

export interface Routing {
  name: string
  groups?: string
  embedded: unknown
  destroy: () => Promise<void>
  change: (Source) => number
  clear: () => boolean
  connections: () => number
  sourcename: () => string
}

export interface Source {
  name: string
  urlAddress?: string
}

export interface FrameType {
  Progressive: 1,
  Interlaced: 0,
  Field0: 2,
  Field1: 3,
}

export interface ColorFormat {
  BGRX_BGRA: 0,
  UYVY_BGRA: 1,
  RGBX_RGBA: 2,
  UYVY_RGBA: 3,
  Fastest: 100,
  Best: 101,
  BGRX_BGRA_FLIPPED: 200,
}

export interface FourCC {
  UYVY: number,
  UYVA: number,
  P216: number,
  PA16: number,
  YV12: number,
  I420: number,
  NV12: number,
  BGRA: number,
  BGRX: number,
  RGBA: number,
  RGBX: number,
  FLTp: number,
}

export interface AudioFormat {
  Float32Separate: 0,
  Float32Interleaved: 1,
  Int16Interleaved: 2
}

export interface Bandwidth {
  MetadataOnly: -10,
  AudioOnly: 10,
  Lowest: 0,
  Highest: 100
}

export function find(params: {
  showLocalSources?: boolean
  groups?: string | string[]
  extraIPs?: string | string[]
}): Promise<Source[]>

export function receive(params: {
  source: Source
  colorFormat?: ColorFormat
  bandwidth?: Bandwidth
  allowVideoFields?: boolean
  name?: string
}): Receiver

export function send(params: {
  name: string
  groups?: string | string[]
  clockVideo?: boolean
  clockAudio?: boolean
}): Sender

export function routing(params: {
  name: string
  groups?: string | string[]
}): Routing

export function isSupportedCPU(): boolean
export function initialize(): boolean
export function destroy(): boolean
export function version(): string