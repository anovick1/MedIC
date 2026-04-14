declare module 'react-native-sherpa-onnx/audio' {
  export type PcmLiveStreamOptions = {
    sampleRate?: number;
    channelCount?: number;
    bufferSizeFrames?: number;
  };

  export type PcmLiveStreamHandle = {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onData: (callback: (samples: Float32Array, sampleRate: number) => void) => () => void;
    onError: (callback: (message: string) => void) => () => void;
  };

  export function createPcmLiveStream(options?: PcmLiveStreamOptions): PcmLiveStreamHandle;
}

declare module 'react-native-sherpa-onnx/stt' {
  export type SttRecognitionResult = {
    text: string;
    tokens: string[];
    timestamps: number[];
    lang: string;
    emotion: string;
    event: string;
    durations: number[];
  };

  export type SttEngine = {
    readonly instanceId: string;
    transcribeFile(filePath: string): Promise<SttRecognitionResult>;
    transcribeSamples(samples: number[], sampleRate: number): Promise<SttRecognitionResult>;
    setConfig(options: any): Promise<void>;
    destroy(): Promise<void>;
  };

  export function detectSttModel(
    modelPath: { type: 'asset' | 'file' | 'auto'; path?: string },
    options?: { preferInt8?: boolean; modelType?: string },
  ): Promise<{
    success: boolean;
    error?: string;
    detectedModels: Array<{ type: string; modelDir: string }>;
    modelType?: string;
  }>;

  export function createSTT(options: any): Promise<SttEngine>;
}
