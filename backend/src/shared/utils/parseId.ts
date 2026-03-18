/**
 * Parsea un parámetro de ruta/query como entero positivo.
 * Lanza un error con statusCode 400 si es inválido.
 */
export function parseId(raw: string | string[] | undefined, label = "ID"): number {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) {
        const err: any = new Error(`${label} es requerido.`);
        err.statusCode = 400;
        throw err;
    }
    const id = parseInt(value, 10);
    if (isNaN(id) || id <= 0) {
        const err: any = new Error(`${label} inválido: "${value}".`);
        err.statusCode = 400;
        throw err;
    }
    return id;
}
