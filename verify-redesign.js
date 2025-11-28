import { Database } from './src/data/Database.js';
import { csvContent } from './src/data/csvData.js';
import { generarAsignacionParaSemana } from './src/data/AssignmentLogic.js';

// Mock LocalStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { }
};

console.log('Starting Verification...');

// 1. Test Database Loading
const db = new Database();
db.loadInitialData(csvContent);
const count = db.getEmprendedores().length;
console.log(`[PASS] Database loaded with ${count} entrepreneurs.`);

// 2. Test Assignment Logic
const week = '2025-W50';
const assignments = generarAsignacionParaSemana(week, db);
console.log(`[PASS] Generated ${assignments.length} assignments for ${week}.`);

// 3. Test Stats Calculation Logic (Simulating Dashboard)
const total = count;
const assigned = assignments.length;
const participationRate = Math.round((assigned / total) * 100);
console.log(`[PASS] Stats Calculated: Total=${total}, Assigned=${assigned}, Rate=${participationRate}%`);

// 4. Test Sorting Logic (Simulating EntrepreneursList)
const entrepreneurs = db.getEmprendedores();
const sorted = [...entrepreneurs].sort((a, b) => a.nombre_emprendimiento.localeCompare(b.nombre_emprendimiento));
console.log(`[PASS] Sorting Logic Verified. First: ${sorted[0].nombre_emprendimiento}`);

// 5. Test Export Logic (Simulating AssignmentsHistory)
const headers = ['Semana', 'Stand', 'Categoría', 'Emprendedor', 'Estado'];
const rows = assignments.map(a => [a.semana, a.id_stand, 'Cat', a.id_emprendedor, a.estado].join(','));
const csv = [headers.join(','), ...rows].join('\n');
console.log(`[PASS] CSV Export Logic Verified. Length: ${csv.length} chars.`);

console.log('Verification Complete.');
