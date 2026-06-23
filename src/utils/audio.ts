/**
 * Clientside low-latency PCM audio stream utility.
 * Input: 16kHz PCM16 Mono (from microphone)
 * Output: 24kHz PCM16 Mono (from Gemini Live API responses)
 */

export class AudioRecorder {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private onAudioChunk: (base64Audio: string) => void;
  
  private currentVolume: number = 0;
  private currentPitch: number = -1;

  constructor(onAudioChunk: (base64Audio: string) => void) {
    this.onAudioChunk = onAudioChunk;
  }

  getCurrentMetrics() {
    return { volume: this.currentVolume, pitch: this.currentPitch };
  }

  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.005) return -1; // too quiet

    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = SIZE - 1; i >= SIZE / 2; i--) {
      if (Math.abs(buffer[i]) < thres) {
        r2 = i;
        break;
      }
    }

    const clippedBuffer = buffer.subarray(r1, r2);
    const clippedSize = clippedBuffer.length;
    if (clippedSize < 64) return -1; // too short to analyze accurately

    const c = new Float32Array(clippedSize);
    for (let i = 0; i < clippedSize; i++) {
      for (let j = 0; j < clippedSize - i; j++) {
        c[i] = c[i] + clippedBuffer[j] * clippedBuffer[j + i];
      }
    }

    let d = 0;
    while (d < clippedSize - 1 && c[d] > c[d + 1]) {
      d++;
    }
    
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < clippedSize; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    const T0 = maxpos;
    if (T0 > 0) {
      const F0 = sampleRate / T0;
      if (F0 >= 60 && F0 <= 600) {
        return F0;
      }
    }
    return -1;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Gemini Bidi PCM expects 16000Hz
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);
      // bufferSize: 4096 is standard and stable
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        this.currentVolume = Math.sqrt(sum / inputData.length);

        // Run correlation to calculate pitch
        this.currentPitch = this.autoCorrelate(inputData, 16000);

        const pcm16 = this.float32ToInt16(inputData);
        const base64 = this.arrayBufferToBase64(pcm16.buffer);
        if (base64) {
          this.onAudioChunk(base64);
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);
    } catch (err) {
      console.error("Critical failure initializing microphone streamer:", err);
      throw err;
    }
  }

  stop() {
    try {
      if (this.processorNode) {
        this.processorNode.onaudioprocess = null;
        this.processorNode.disconnect();
        this.processorNode = null;
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      if (this.audioCtx && this.audioCtx.state !== "closed") {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch (e) {
      console.warn("AudioRecorder stop warning:", e);
    }
  }

  private float32ToInt16(floatArray: Float32Array): Int16Array {
    const intArray = new Int16Array(floatArray.length);
    for (let i = 0; i < floatArray.length; i++) {
      const s = Math.max(-1, Math.min(1, floatArray[i]));
      intArray[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return intArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private audioSources: AudioBufferSourceNode[] = [];

  constructor() {
    this.initAudioContext();
  }

  playSassyCue(text: string) {
    if (!this.audioCtx) return;
    
    // Play a gorgeous sassy chime synthesizer sound using AudioContext oscillators!
    try {
      const now = this.audioCtx.currentTime;
      
      // Play cute sassy double pulse tone (frequency envelope chime)
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc1.type = "sine";
      osc2.type = "triangle";
      
      // Fun sassy slide pattern
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      
      osc2.frequency.setValueAtTime(293.66, now); // D4
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.15); // A4
      
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn("AudioPlayer sassy chime failed:", e);
    }

    // Play the beautiful spoken Bengali voice using browser SpeechSynthesis
    try {
      if ('speechSynthesis' in window) {
        // Cancel first to make it highly responsive/sassy
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "bn-IN"; // standard Bengali female voice region
        
        // Find a female voice if possible
        const voices = window.speechSynthesis.getVoices();
        const bVoice = voices.find(v => v.lang.toLowerCase().includes("bn"));
        if (bVoice) {
          utterance.voice = bVoice;
        }
        
        // Add a sassy pitch & slightly faster pace
        utterance.pitch = 1.35; // young sassy female pitch
        utterance.rate = 1.05; // confident pace
        utterance.volume = 0.95;
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("SpeechSynthesis for sassy cue failed:", e);
    }
  }

  private initAudioContext() {
    try {
      // Audio returned from Gemini Live is 24000Hz (24kHz)
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      this.nextStartTime = this.audioCtx.currentTime;
    } catch (e) {
      console.error("AudioPlayer initial AudioContext failed:", e);
    }
  }

  // Resumes user interaction blocked states
  async resumeEnriched() {
    if (!this.audioCtx) {
      this.initAudioContext();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }
  }

  playChunk(base64pcm: string) {
    if (!this.audioCtx) return;

    try {
      // Decode base64 to bytes
      const binary = window.atob(base64pcm);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Safe Uint8 to Int16 alignment
      const alignedLength = Math.floor(len / 2);
      const buffer = new ArrayBuffer(alignedLength * 2);
      const uint8Aligned = new Uint8Array(buffer);
      uint8Aligned.set(bytes.subarray(0, alignedLength * 2));

      const int16 = new Int16Array(buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      // Schedule float audio buffer
      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      this.audioSources.push(source);

      // Protect against scheduling gap drift
      const now = this.audioCtx.currentTime;
      if (this.nextStartTime < now) {
        this.nextStartTime = now + 0.05; // tiny buffer buffer limit
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      source.onended = () => {
        this.audioSources = this.audioSources.filter((s) => s !== source);
      };
    } catch (e) {
      console.warn("AudioPlayer stream chunk decoding failed:", e);
    }
  }

  stopAll() {
    try {
      this.audioSources.forEach((src) => {
        try {
          src.stop();
          src.disconnect();
        } catch (e) {
          // ignore already stopped ones
        }
      });
      this.audioSources = [];
      if (this.audioCtx) {
        this.nextStartTime = this.audioCtx.currentTime;
      }
    } catch (err) {
      console.warn("AudioPlayer stopAll warning:", err);
    }
  }

  destroy() {
    this.stopAll();
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
