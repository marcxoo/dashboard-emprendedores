/**
 * Cliente para sincronizar con PostgreSQL local
 * Envía datos al servidor local de sincronización
 */

const LOCAL_SYNC_URL = 'http://localhost:3001';

// Helper para verificar si el servidor local está disponible
let isLocalServerAvailable = true;

async function checkLocalServer() {
    try {
        const response = await fetch(`${LOCAL_SYNC_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(1000) // 1 segundo timeout
        });
        isLocalServerAvailable = response.ok;
    } catch {
        isLocalServerAvailable = false;
    }
    return isLocalServerAvailable;
}

// Verificar cada 30 segundos si el servidor está disponible
setInterval(checkLocalServer, 30000);
checkLocalServer(); // Check inicial

/**
 * Sincroniza un emprendedor con PostgreSQL local
 */
export async function syncEntrepreneurToLocal(entrepreneur) {
    if (!isLocalServerAvailable) {
        console.log('⚠️ Servidor local no disponible, saltando sync');
        return false;
    }

    try {
        const response = await fetch(`${LOCAL_SYNC_URL}/sync/entrepreneur`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entrepreneur),
            signal: AbortSignal.timeout(3000) // 3 segundos timeout
        });

        if (response.ok) {
            console.log('✅ Sincronizado a PostgreSQL local:', entrepreneur.persona_contacto);
            return true;
        } else {
            console.warn('⚠️ Error en respuesta del servidor local');
            return false;
        }
    } catch (err) {
        console.warn('⚠️ No se pudo sincronizar a local (servidor no disponible)');
        isLocalServerAvailable = false;
        return false;
    }
}

/**
 * Sincroniza una asignación con PostgreSQL local
 */
export async function syncAssignmentToLocal(assignment) {
    if (!isLocalServerAvailable) return false;

    try {
        const response = await fetch(`${LOCAL_SYNC_URL}/sync/assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignment),
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch {
        isLocalServerAvailable = false;
        return false;
    }
}

/**
 * Elimina un emprendedor de PostgreSQL local
 */
export async function deleteEntrepreneurFromLocal(id) {
    if (!isLocalServerAvailable) return false;

    try {
        const response = await fetch(`${LOCAL_SYNC_URL}/sync/entrepreneur/${id}`, {
            method: 'DELETE',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch {
        isLocalServerAvailable = false;
        return false;
    }
}
