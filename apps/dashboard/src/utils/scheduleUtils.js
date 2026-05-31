import { getTodayKey } from './dateUtils'
import { getHolidayDateSet } from './holidayUtils'

export const SCHEDULE_MODES = {
  school:  'school',
  weekend: 'weekend',
  summer:  'summer',
  holiday: 'holiday',
}

export const SCHEDULE_LABELS = {
  school:  'School Day',
  weekend: 'Weekend',
  summer:  'Summer Break',
  holiday: 'Break Day',
}

// scheduleConfig shape (from DB):
//   { summer: { start, end } | null, disabledHolidays: string[], breaks: { id, name, start, end }[] }
export function getCurrentScheduleMode(date, scheduleConfig = {}) {
  const dayOfWeek = date.getDay()
  const todayKey  = getTodayKey(date)
  const { summer, disabledHolidays = [], breaks = [] } = scheduleConfig

  if (summer && todayKey >= summer.start && todayKey <= summer.end) {
    return SCHEDULE_MODES.summer
  }

  const year = date.getFullYear()
  const holidayDates = getHolidayDateSet([year - 1, year, year + 1], disabledHolidays)
  if (holidayDates.has(todayKey)) {
    return SCHEDULE_MODES.holiday
  }

  for (const period of breaks) {
    if (todayKey >= period.start && todayKey <= period.end) {
      return SCHEDULE_MODES.holiday
    }
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return SCHEDULE_MODES.weekend
  }

  return SCHEDULE_MODES.school
}
