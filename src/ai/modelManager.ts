import { useState, useEffect } from 'react';
import { initLlama } from 'llama.rn';

// Model lives at /data/local/tmp/medic_models/ on device
// Push with: adb push qwen3-1.7b-q4_k_m.gguf /data/local/tmp/medic_models/
const MODEL_PATH = 'file:///data/local/tmp/medic_models/qwen3-1.7b-q4_k_m.gguf';

const LLAMA_STOP_WORDS = [
  '</s>', '<|end|>', '<|eot_id|>', '<|end_of_text|>',
  '<|im_end|>', '<|EOT|>', '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>', '<|endoftext|>',
];

let _context: any = null;
let _loading = false;
let _loaded = false;
let _error: string | null = null;
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export async function loadModel(): Promise<void> {
  if (_loaded || _loading) return;
  _loading = true;
  _error = null;
  notify();

  try {
    console.log('[Qwen3] Starting model load from:', MODEL_PATH);
    const llamaModule = require('llama.rn');
    console.log('[Qwen3] llama.rn loaded, initLlama type:', typeof llamaModule.initLlama);
    _context = await initLlama({
      model: MODEL_PATH,
      use_mlock: true,
      n_ctx: 2048,
      n_batch: 512,
      n_threads: 4,
      n_gpu_layers: 0, // set > 0 if device has OpenCL GPU support
    });
    _loaded = true;
    _loading = false;
    _error = null;
    console.log('[Qwen3] Model loaded successfully ✓');
  } catch (e: any) {
    _loading = false;
    _loaded = false;
    _error = e?.message ?? 'Failed to load model';
    console.warn('[Qwen3] Model load FAILED:', _error);
  }
  notify();
}

export function getContext(): any {
  return _context;
}

export function getStopWords(): string[] {
  return LLAMA_STOP_WORDS;
}

export function isModelLoaded(): boolean {
  return _loaded;
}

export function isModelLoading(): boolean {
  return _loading;
}

export function getModelError(): string | null {
  return _error;
}

export function useModelPreload() {
  const [status, setStatus] = useState({
    loading: _loading,
    loaded: _loaded,
    error: _error,
  });

  useEffect(() => {
    const listener = () => {
      setStatus({ loading: _loading, loaded: _loaded, error: _error });
    };
    _listeners.push(listener);
    loadModel();
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  }, []);

  return status;
}
