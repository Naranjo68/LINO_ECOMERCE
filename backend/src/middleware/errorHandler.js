import { HttpError } from './HttpError.js';
export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido.' });
  }
  const code = error instanceof HttpError ? error.status : 500;
  if (code >= 500) console.error('[API LINO]', error.message);
  response.status(code).json({ error: code >= 500 ? 'No se pudo completar la operación. Intenta nuevamente.' : error.message });
}
