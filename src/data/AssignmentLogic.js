import { STANDS } from './Database.js';

export function generarAsignacionParaSemana(semana, db) {
    const assignments = [];
    const assignedIds = new Set();
    const blocks = ['lunes-martes', 'miercoles-jueves', 'viernes'];
    const shifts = ['manana', 'tarde'];

    blocks.forEach(block => {
        shifts.forEach(shift => {
            const currentShiftCategories = new Set();

            STANDS.forEach(stand => {
                // 1. Filter candidates
                let candidates = db.emprendedores.filter(e => {
                    // Category match (now mostly irrelevant as stands are Libre/Mixto, but kept for safety)
                    if (stand.category !== 'Libre / Mixto' && e.categoria_principal !== stand.category) {
                        return false;
                    }
                    return true;
                });

                // 2. Exclusions
                candidates = candidates.filter(e => {
                    // Already assigned this week (in any block/shift)
                    if (assignedIds.has(e.id)) return false;

                    // Participated in last 3 weeks
                    if (e.ultima_semana_participacion) {
                        const lastWeek = e.ultima_semana_participacion;
                        if (isWithinLast3Weeks(semana, lastWeek)) return false;
                    }

                    // Rejected twice consecutively
                    if (hasRejectedTwice(e.id, db)) return false;

                    return true;
                });

                // 3. Sort with Variety Priority
                candidates.sort((a, b) => {
                    // Priority 0: Category Variety (New category for this shift > Existing category)
                    const aHasCat = currentShiftCategories.has(a.categoria_principal);
                    const bHasCat = currentShiftCategories.has(b.categoria_principal);

                    if (!aHasCat && bHasCat) return -1; // a is better (new category)
                    if (aHasCat && !bHasCat) return 1;  // b is better (new category)

                    // Priority 1: Never participated (veces_en_stand = 0)
                    if (a.veces_en_stand === 0 && b.veces_en_stand > 0) return -1;
                    if (b.veces_en_stand === 0 && a.veces_en_stand > 0) return 1;

                    // Priority 2: Fewer times
                    if (a.veces_en_stand !== b.veces_en_stand) {
                        return a.veces_en_stand - b.veces_en_stand;
                    }

                    // Priority 3: ID (Registration order)
                    return a.id - b.id;
                });

                // 4. Select best
                const bestCandidate = candidates[0];

                if (bestCandidate) {
                    const assignment = {
                        id_asignacion: Date.now() + Math.random(),
                        id_stand: stand.id,
                        id_emprendedor: bestCandidate.id,
                        semana: semana,
                        estado: 'invitado',
                        comentarios: '',
                        bloque: block,
                        jornada: shift
                    };
                    assignments.push(assignment);
                    assignedIds.add(bestCandidate.id);
                    currentShiftCategories.add(bestCandidate.categoria_principal);
                }
            });
        });
    });

    return assignments;
}

function isWithinLast3Weeks(currentWeek, lastWeek) {
    if (!lastWeek) return false;
    // Format: YYYY-Wnn
    const [y1, w1] = currentWeek.split('-W').map(Number);
    const [y2, w2] = lastWeek.split('-W').map(Number);

    // Convert to absolute week number (approx)
    const abs1 = y1 * 52 + w1;
    const abs2 = y2 * 52 + w2;

    const diff = abs1 - abs2;
    return diff > 0 && diff <= 3;
}

function hasRejectedTwice(emprendedorId, db) {
    // Check history of assignments for this entrepreneur
    // Sort by week desc
    // If last 2 are 'rechazó', return true.

    const history = db.asignaciones
        .filter(a => a.id_emprendedor === emprendedorId)
        .sort((a, b) => b.semana.localeCompare(a.semana)); // Descending

    if (history.length < 2) return false;

    return history[0].estado === 'rechazó' && history[1].estado === 'rechazó';
}
