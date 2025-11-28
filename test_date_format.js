function formatDate(weekString, block) {
    if (!weekString || !block) return '-';

    try {
        const [yearStr, weekStr] = weekString.split('-W');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);

        console.log(`Input: ${weekString}, Year: ${year}, Week: ${week}`);

        // Calculate Monday of ISO Week 1
        const jan4 = new Date(year, 0, 4);
        const dayOfJan4 = jan4.getDay() || 7; // Mon=1, Sun=7
        const mondayWeek1 = new Date(year, 0, 4 - dayOfJan4 + 1);

        // Calculate Monday of the target week
        const mondayCurrentWeek = new Date(mondayWeek1);
        mondayCurrentWeek.setDate(mondayWeek1.getDate() + (week - 1) * 7);

        let startDate = new Date(mondayCurrentWeek);
        let endDate = null;

        if (block === 'lunes-martes') {
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
        } else if (block === 'miercoles-jueves') {
            startDate.setDate(startDate.getDate() + 2);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
        } else if (block === 'viernes') {
            startDate.setDate(startDate.getDate() + 4);
        }

        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const startStr = startDate.toLocaleDateString('es-ES', options);

        if (endDate) {
            const endStr = endDate.toLocaleDateString('es-ES', options);
            return `${startStr} - ${endStr}`;
        }
        return startStr;
    } catch (e) {
        console.error("Error formatting date:", e);
        return '-';
    }
}

// Test cases
console.log("Test 1 (Valid):", formatDate("2025-W48", "lunes-martes"));
console.log("Test 2 (Invalid Week):", formatDate("invalid", "lunes-martes"));
console.log("Test 3 (Null):", formatDate(null, "lunes-martes"));
console.log("Test 4 (Undefined):", formatDate(undefined, "lunes-martes"));
console.log("Test 5 (Empty):", formatDate("", "lunes-martes"));
console.log("Test 6 (NaN Year):", formatDate("NaN-W48", "lunes-martes"));
console.log("Test 7 (Partial):", formatDate("2025", "lunes-martes"));
