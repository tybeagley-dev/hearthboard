// Returns YYYY-MM-DD string for the Nth weekday of a given month/year.
// weekday: 0=Sun … 6=Sat, n: 1-based (1=first, -1=last)
function nthWeekday(year, month, weekday, n) {
  if (n > 0) {
    const d = new Date(year, month - 1, 1)
    const diff = (weekday - d.getDay() + 7) % 7
    d.setDate(1 + diff + (n - 1) * 7)
    return toKey(d)
  } else {
    // n === -1 → last occurrence
    const last = new Date(year, month, 0) // last day of month
    const diff = (last.getDay() - weekday + 7) % 7
    last.setDate(last.getDate() - diff)
    return toKey(last)
  }
}

function toKey(d) {
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD
}

function fixed(year, month, day) {
  return toKey(new Date(year, month - 1, day))
}

export const CALCULATED_HOLIDAYS = [
  { id: 'new-years',      name: "New Year's Day",    calc: y => fixed(y, 1, 1) },
  { id: 'mlk-day',        name: 'MLK Day',            calc: y => nthWeekday(y, 1, 1, 3) },
  { id: 'presidents-day', name: "Presidents' Day",    calc: y => nthWeekday(y, 2, 1, 3) },
  { id: 'memorial-day',   name: 'Memorial Day',       calc: y => nthWeekday(y, 5, 1, -1) },
  { id: 'juneteenth',     name: 'Juneteenth',         calc: y => fixed(y, 6, 19) },
  { id: 'independence',   name: 'Independence Day',   calc: y => fixed(y, 7, 4) },
  { id: 'pioneer-day',    name: 'Pioneer Day',        calc: y => fixed(y, 7, 24) },
  { id: 'labor-day',      name: 'Labor Day',          calc: y => nthWeekday(y, 9, 1, 1) },
  { id: 'columbus-day',   name: 'Columbus Day',       calc: y => nthWeekday(y, 10, 1, 2) },
  { id: 'veterans-day',   name: 'Veterans Day',       calc: y => fixed(y, 11, 11) },
  { id: 'thanksgiving',   name: 'Thanksgiving',       calc: y => nthWeekday(y, 11, 4, 4) },
  { id: 'black-friday',   name: 'Black Friday',       calc: y => nthWeekday(y, 11, 5, 4) },
  { id: 'christmas',      name: 'Christmas',          calc: y => fixed(y, 12, 25) },
]

// Returns a Set of YYYY-MM-DD keys for all enabled calculated holidays
// across the given years, excluding any ids in disabledHolidays.
export function getHolidayDateSet(years, disabledHolidays = []) {
  const disabled = new Set(disabledHolidays)
  const dates = new Set()
  for (const year of years) {
    for (const h of CALCULATED_HOLIDAYS) {
      if (!disabled.has(h.id)) dates.add(h.calc(year))
    }
  }
  return dates
}
