export function getDateRangeFromWeek(weekString) {
    if (!weekString) return '-';

    // Format expected: YYYY-Wnn
    const parts = weekString.split('-W');
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
