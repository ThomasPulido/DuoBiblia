export const prayerTracks = [
  {
    id: "como-agradecer",
    src: "./audio/como-agradecer.mp3",
    label: { es: "Cómo Agradecer · Instrumental", en: "How to Give Thanks · Instrumental" }
  },
  {
    id: "sublime-gracia",
    src: "./audio/sublime-gracia.mp3",
    label: { es: "Sublime Gracia · Instrumental", en: "Amazing Grace · Instrumental" }
  },
  {
    id: "cuan-grande",
    src: "./audio/cuan-grande.mp3",
    label: { es: "Cuán Grande · Instrumental", en: "How Great Thou Art · Instrumental" }
  },
  {
    id: "come-thou-fount",
    src: "./audio/come-thou-fount.mp3",
    label: { es: "Fuente de toda bendición · Instrumental", en: "Come Thou Fount · Instrumental" }
  }
];

export function chooseNextTrack(currentId = null, random = Math.random) {
  const candidates = prayerTracks.filter((track) => track.id !== currentId);
  const pool = candidates.length ? candidates : prayerTracks;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
