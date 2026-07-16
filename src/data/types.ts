export type SelectedBar = {
  index: number
  hz: number
  amplitude: number
}

export type AudioData = {
  freqData: Uint8Array
  rms: number
  peakHz: number
  isListening: boolean
  selectedBar: SelectedBar | null
}

export type AudioSnapshot = {
  freqData: Uint8Array
  rms: number
  peakHz: number
}
