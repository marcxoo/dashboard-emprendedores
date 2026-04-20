/**
 * Heuristic-based gender detection for Spanish names.
 * @param {string} name - Contact person's name 
 * @returns {'Masculino' | 'Femenino' | 'No especificado'}
 */
export const detectGender = (name) => {
    if (!name || typeof name !== 'string') return 'No especificado';

    const cleanName = name.trim().toLowerCase();
    const firstWord = cleanName.split(' ')[0];
    
    // Common endings in Spanish
    if (firstWord.endsWith('a') || firstWord.endsWith('any') || firstWord.endsWith('ifer') || firstWord.endsWith('eth')) {
        // Exclude common male names ending in 'a'
        const maleExceptions = ['luca', 'musa', 'elai', 'noa'];
        if (maleExceptions.includes(firstWord)) return 'Masculino';
        return 'Femenino';
    }

    if (firstWord.endsWith('o') || firstWord.endsWith('os') || firstWord.endsWith('uel') || firstWord.endsWith('er')) {
        // Exclude common female names ending in 'o' or similar
        const femaleExceptions = [
            'amparo', 'consuelo', 'rosario', 'rocio', 'socorro', 
            'merceder', 'esther', 'jennifer'
        ];
        if (femaleExceptions.includes(firstWord)) return 'Femenino';
        return 'Masculino';
    }

    // Common Spanish Female names/prefixes
    const femalePrefixes = [
        'maria', 'ana', 'rosa', 'luz', 'dora', 'norma', 'flor', 
        'nelly', 'narcisa', 'marjorie', 'viviana', 'isabela', 
        'ruth', 'monica', 'mariuxi', 'esthelita', 'nohelia', 
        'sonnia', 'silvia', 'jazmin', 'delia', 'katherin', 
        'olga', 'mercedes', 'juana', 'leslie', 'teresa', 'leonor'
    ];
    
    if (femalePrefixes.some(p => firstWord === p || cleanName.startsWith(p + ' '))) {
        return 'Femenino';
    }

    // Common Spanish Male names/prefixes
    const malePrefixes = [
        'jose', 'juan', 'carlos', 'luis', 'pedro', 'jorge', 
        'miguel', 'angel', 'cesar', 'mauricio', 'jair', 
        'danny', 'felix', 'jesus', 'jhonny', 'erwing', 
        'ivan', 'rody', 'edwin', 'roddy', 'steven', 'victor'
    ];

    if (malePrefixes.some(p => firstWord === p || cleanName.startsWith(p + ' '))) {
        return 'Masculino';
    }

    return 'No especificado';
};
