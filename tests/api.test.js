import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporal = await mkdtemp(path.join(tmpdir(), 'lino-tests-'));
const destino = path.join(temporal, 'tienda.json');
process.env.LINO_DATA_FILE = destino;
const { crearApp } = await import('../backend/src/app.js');
let servidor;
let direccion;

before(async () => {
  const ejemplo = await readFile(path.join(root, 'data', 'tienda.example.json'));
  await writeFile(destino, ejemplo);
  servidor = crearApp().listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  direccion = `http://127.0.0.1:${servidor.address().port}`;
});
after(async () => {
  await new Promise(resolve => servidor.close(resolve));
  await rm(temporal, { recursive: true, force: true });
});

async function api(ruta, metodo = 'GET', contenido) {
  const r = await fetch(direccion + ruta, { method: metodo, headers: { 'Content-Type': 'application/json' }, ...(contenido ? { body: JSON.stringify(contenido) } : {}) });
  return { estado: r.status, datos: await r.json() };
}

test('P01 filtra el catálogo por categoría', async () => {
  const { estado, datos } = await api('/api/productos?categoria=mujer');
  assert.equal(estado, 200);
  assert.ok(datos.productos.length > 1);
  assert.ok(datos.productos.every(p => p.categoria === 'mujer'));
});
test('P02 un producto inexistente responde 404', async () => {
  const { estado } = await api('/api/productos/no-existe');
  assert.equal(estado, 404);
});
test('P04 la cantidad cero se rechaza', async () => {
  const { estado } = await api('/api/pedidos', 'POST', { claveSolicitud: 'intento-0001', items: [{ varianteId: 'var-002', cantidad: 0 }] });
  assert.equal(estado, 400);
});
test('P05, P07 y P08 registra, conserva y no duplica un pedido', async () => {
  const envio = { claveSolicitud: 'intento-prueba-002', items: [{ varianteId: 'var-002', cantidad: 2 }] };
  const primera = await api('/api/pedidos', 'POST', envio);
  assert.equal(primera.estado, 201);
  assert.equal(primera.datos.pedido.totalCentimos, 11980);
  const segunda = await api('/api/pedidos', 'POST', envio);
  assert.equal(segunda.estado, 200);
  assert.equal(segunda.datos.pedido.id, primera.datos.pedido.id);
  const guardado = JSON.parse(await readFile(destino, 'utf8'));
  assert.equal(guardado.pedidos.length, 1);
  assert.equal(guardado.productos[0].variantes.find(v => v.id === 'var-002').stock, 10);
});
test('P06 rechaza stock excesivo sin registrar pedido', async () => {
  const previo = JSON.parse(await readFile(destino, 'utf8'));
  const { estado } = await api('/api/pedidos', 'POST', { claveSolicitud: 'intento-prueba-003', items: [{ varianteId: 'var-002', cantidad: 99 }] });
  assert.equal(estado, 409);
  const nuevo = JSON.parse(await readFile(destino, 'utf8'));
  assert.equal(nuevo.pedidos.length, previo.pedidos.length);
  assert.equal(nuevo.revision, previo.revision);
});
test('P09 concurrencia: solamente una compra obtiene la última unidad', async () => {
  const solicitudes = [
    { claveSolicitud: 'prueba-concurrente-1', items: [{ varianteId: 'var-008', cantidad: 2 }] },
    { claveSolicitud: 'prueba-concurrente-2', items: [{ varianteId: 'var-008', cantidad: 2 }] },
  ];
  const resultados = await Promise.all(solicitudes.map(s => api('/api/pedidos', 'POST', s)));
  assert.deepEqual(resultados.map(r => r.estado).sort(), [201, 409]);
});
