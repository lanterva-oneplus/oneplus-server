import drums from '@audio/mir-drums'
import { OfflineAudioContext } from 'node-web-audio-api'

/**
 * @typedef {'south' | 'east' | 'west' | 'north'} NoteDir
 * @typedef {{ time: number, dir: NoteDir }} Note
 * @typedef {{ notes: Note[], lengthSec: number }} NoteResult
 */

const SAMPLE_RATE = 22050

export default class NoteService {
  MIN_STRENGTH = 0.4 // 약한 타격 무시
  HIGH_RATIO = 0.15 // north 판정 고음역(bands.high)
  HIGH_PERCENTILE = 0.85 // 곡 안에서 고음 비율이 이 백분위 이상이어야 north (곡마다 쏠림 방지)
  HIGH_MIN_STRENGTH = 0.1 // north 후보의 최소 세기 (hihat은 세기가 약함)
  MIN_GAP = 0.25 // 노트 사이 최소 간격 sec
  MIN_START = 2.0 // 시작 시간

  /**
   * @param {ArrayBuffer} arrayBuffer 
   * @returns {Promise<NoteResult>}
   */
  async generate(arrayBuffer) {
    const audio = await new OfflineAudioContext(1, 1, SAMPLE_RATE).decodeAudioData(arrayBuffer)
    const hits = drums(audio.getChannelData(0), { fs: SAMPLE_RATE })

    const highs = hits.map((h) => h.bands.high).sort((a, b) => a - b)
    const highThreshold = Math.max(this.HIGH_RATIO, highs[Math.floor(highs.length * this.HIGH_PERCENTILE)] ?? 0)

    let isEast = true
    let lastTime = -Infinity
    /** @type {Note[]} */
    const notes = []

    for (const h of hits) {
      if (h.time < this.MIN_START - 0.1) continue

      const isHigh = h.bands.high >= highThreshold && h.strength >= this.HIGH_MIN_STRENGTH
      if (!isHigh && h.strength < this.MIN_STRENGTH) continue
      if (h.time - lastTime < this.MIN_GAP) continue
      lastTime = h.time

      /** @type {NoteDir} */
      let dir = 'south'
      if (isHigh) dir = 'north'
      else if (h.type !== 'kick') {
        dir = isEast ? 'east' : 'west'
        isEast = !isEast
      }
      notes.push({ time: Math.round(h.time * 100) / 100, dir })
    }

    return { notes, lengthSec: Math.round(audio.duration) }
  }
}
