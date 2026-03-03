export function getDateRangeFromWeek(weekString) {
    if (!weekString) return '-';

    // Format expected: YYYY-Wnn or YYYY-Snn
    const parts = weekString.split(/-[WS]/);
    if (parts.length !== 2) return weekString;

    const year = parseInt(parts[0], 10);
    const week = parseInt(parts[1], 10);

    // Calculate Monday of the given week
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    // Format: DD/MM/YYYY
    const day = ISOweekStart.getDate().toString().padStart(2, '0');
    const month = (ISOweekStart.getMonth() + 1).toString().padStart(2, '0');
    const yearStr = ISOweekStart.getFullYear();

    return `${day}/${month}/${yearStr}`;
}

export function getWeekNumberString(d) {
    const week = getWeekNumber(d);
    const year = d.getFullYear();
    return `${year}-S${week.toString().padStart(2, '0')}`;
}

export function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

export function compareWeeks(w1, w2) {
    if (!w1 || !w2) return 0;
    // Normalize to S format for comparison if needed, or just parse year/week
    // Format: YYYY-[SW]XX
    const parseWeek = (w) => {
        const parts = w.split(/-[SW]/);
        if (parts.length !== 2) return { year: 0, week: 0 };
        return { year: parseInt(parts[0]), week: parseInt(parts[1]) };
    };

    const p1 = parseWeek(w1);
    const p2 = parseWeek(w2);

    if (p1.year !== p2.year) return p1.year - p2.year;
    return p1.week - p2.week;
}

export function sortWeeksDesc(weeks) {
    return [...weeks].sort((a, b) => compareWeeks(b, a));
}
