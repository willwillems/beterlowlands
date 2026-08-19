// Wall-clock math for the timetable. All schedule strings are Europe/Amsterdam
// wall time ("YYYY-MM-DD HH:MM:SS"); layout math works on those strings
// directly, so it is independent of the viewer's timezone. (No DST transition
// falls inside the festival window, so linear minute math is safe.)

export const GRID_START = '2026-08-21 10:30:00'
export const TOTAL_HOURS = 72
export const SLOT_MINUTES = 5
export const SLOT_WIDTH = 12 // px per 5-minute slot
export const STAGE_COL_WIDTH = 66 // px, the sticky stage-name column

export const TOTAL_SLOTS = (TOTAL_HOURS * 60) / SLOT_MINUTES

const toLinearMinutes = s => {
	const [y, mo, d] = s.substring(0, 10).split('-').map(Number)
	const [h, mi] = s.substring(11, 16).split(':').map(Number)
	return Date.UTC(y, mo - 1, d, h, mi) / 60000
}

const gridStart = toLinearMinutes(GRID_START)

export const minutesSinceStart = s => toLinearMinutes(s) - gridStart
export const slotOf = s => minutesSinceStart(s) / SLOT_MINUTES
export const minutesToX = minutes => (minutes / SLOT_MINUTES) * SLOT_WIDTH

export const nowInAmsterdam = () =>
	new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Europe/Amsterdam',
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit',
		hour12: false,
	}).format(new Date())

export const days = [
	{ label: 'VR', start: '2026-08-21 10:30:00' },
	{ label: 'ZA', start: '2026-08-22 09:00:00' },
	{ label: 'ZO', start: '2026-08-23 09:00:00' },
]

// Which festival day a grid minute belongs to (shows past midnight count
// as the previous day).
export const dayIndexAt = minutes => {
	for (let i = days.length - 1; i >= 0; i--) {
		if (minutes >= minutesSinceStart(days[i].start)) return i
	}
	return 0
}

const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
export const weekdayOf = s => {
	const [y, mo, d] = s.substring(0, 10).split('-').map(Number)
	return WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()]
}

export const timeLabel = slot => {
	const minutes = gridStart + slot * SLOT_MINUTES
	const h = Math.floor(minutes / 60) % 24
	const m = minutes % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const overlaps = (a, b) => a.start < b.end && b.start < a.end
