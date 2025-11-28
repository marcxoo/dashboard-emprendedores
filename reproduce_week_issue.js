function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

const dateString = "2025-12-01";
const dateUTC = new Date(dateString);
console.log(`Input: ${dateString}`);
console.log(`Date (UTC parsing): ${dateUTC.toISOString()}`);
console.log(`Week (UTC parsing): ${getWeekNumber(dateUTC)}`);

const [y, m, d] = dateString.split('-').map(Number);
const dateLocal = new Date(y, m - 1, d);
console.log(`Date (Local parsing): ${dateLocal.toString()}`);
console.log(`Week (Local parsing): ${getWeekNumber(dateLocal)}`);
