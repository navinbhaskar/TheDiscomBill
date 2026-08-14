const PIXABAY_CLICK_SRC = 'https://cdn.pixabay.com/download/audio/2021/09/20/audio_8c1876e3b4.mp3?filename=click-button-140881.mp3';

let clickAudio = null;
let audioCtx = null;

function playFallbackClick() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audioCtx ||= new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.035);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function playMeterClick() {
  if (!clickAudio) {
    clickAudio = new Audio(PIXABAY_CLICK_SRC);
    clickAudio.preload = 'auto';
    clickAudio.volume = 0.45;
  }

  try {
    clickAudio.currentTime = 0;
    const played = clickAudio.play();
    if (played && typeof played.catch === 'function') {
      played.catch(playFallbackClick);
    }
  } catch {
    playFallbackClick();
  }
}
