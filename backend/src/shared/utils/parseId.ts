/**
 * Parsea un parámetro de ruta/query como entero positivo.
 * Lanza un error con statusCode 400 si es inválido.
 */
export function parseId(raw: string | undefined, label = "ID"): number {
    if (!raw) {
        const err: any = new Error(`${label} es requerido.`);
        err.statusCode = 400;
        throw err;
    }
    const id = parseInt(raw, 10);
    if (isNaN(id) || id <= 0) {
        const err: any = new Error(`${label} inválido: "${raw}".`);
        err.statusCode = 400;
        throw err;
    }
    return id;
}
