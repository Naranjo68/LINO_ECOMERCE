import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../..",
);
const archivo = () =>
    process.env.LINO_DB_FILE || path.join(raiz, "data", "bd.json");
let cola = Promise.resolve();

async function leerBd() {
    try {
        const bd = JSON.parse(await readFile(archivo(), "utf8"));
        if (!bd || !Array.isArray(bd.usuarios))
            throw new Error('bd.json inválido: falta la lista "usuarios".');
        return bd;
    } catch (error) {
        // Si el archivo todavía no existe, se parte de una base vacía.
        if (error.code === "ENOENT") return { usuarios: [] };
        throw error;
    }
}

export async function leerUsuarios() {
    return (await leerBd()).usuarios;
}

export function actualizarUsuarios(mutar) {
    const operacion = cola.then(async () => {
        const bd = await leerBd();
        const resultado = await mutar(bd.usuarios);
        const destino = archivo();
        await mkdir(path.dirname(destino), { recursive: true });
        const temporal = path.join(path.dirname(destino), `bd.${randomUUID()}.tmp`);
        await writeFile(temporal, JSON.stringify(bd, null, 2) + "\n", {
            flag: "wx",
        });
        await rename(temporal, destino);
        return resultado;
    });
    // Un error en una operación no debe bloquear las siguientes.
    cola = operacion.catch(() => { });
    return operacion;
}
