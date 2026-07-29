export type WavRecorder = {
  stop: () => Promise<{ blob: Blob; durationMs: number; rmsDb: number; clippingRatio: number }>;
};

function encodeWav(chunks: Float32Array[], inputRate: number) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const samples = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    samples.set(chunk, offset);
    offset += chunk.length;
  }

  const outputRate = 16000;
  const ratio = inputRate / outputRate;
  const outputLength = Math.round(samples.length / ratio);
  const buffer = new ArrayBuffer(44 + outputLength * 2);
  const view = new DataView(buffer);
  const write = (position: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(position + index, value.charCodeAt(index));
    }
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + outputLength * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, outputRate, true);
  view.setUint32(28, outputRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, outputLength * 2, true);

  for (let index = 0; index < outputLength; index += 1) {
    const sampleIndex = Math.min(Math.round(index * ratio), samples.length - 1);
    const sample = Math.max(-1, Math.min(1, samples[sampleIndex] || 0));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function startWavRecording(): Promise<WavRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  const startedAt = performance.now();

  processor.onaudioprocess = (event) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(context.destination);

  return {
    stop: async () => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await context.close();
      let sumSquares = 0;
      let clipped = 0;
      let sampleCount = 0;
      for (const chunk of chunks) {
        for (const sample of chunk) {
          sumSquares += sample * sample;
          if (Math.abs(sample) >= .98) clipped += 1;
          sampleCount += 1;
        }
      }
      const rms = Math.sqrt(sumSquares / Math.max(sampleCount, 1));
      return {
        blob: encodeWav(chunks, context.sampleRate),
        durationMs: Math.round(performance.now() - startedAt),
        rmsDb: 20 * Math.log10(Math.max(rms, 0.00001)),
        clippingRatio: clipped / Math.max(sampleCount, 1),
      };
    },
  };
}
