export function mergeProgress(saved = {}, local = {}) {
  return {
    ...saved,
    ...local,
    streak: Math.max(Number(saved.streak) || 0, Number(local.streak) || 0),
    points: Math.max(Number(saved.points) || 0, Number(local.points) || 0),
    readChapters: Math.max(Number(saved.readChapters) || 0, Number(local.readChapters) || 0),
    lastPrayerDate: [saved.lastPrayerDate, local.lastPrayerDate].filter(Boolean).sort().at(-1) || null,
    favorites: [...new Set([...(saved.favorites || []), ...(local.favorites || [])])],
    notes: { ...(saved.notes || {}), ...(local.notes || {}) }
  };
}
