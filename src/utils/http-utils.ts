import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'http';

/**
 * Composes and sends an HTTP response
 */
export function sendResponse(res: ServerResponse, statusCode: number, body: string, headers: OutgoingHttpHeaders) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

/**
 * Sends a redirect response
 */
export function redirect(res: ServerResponse, location: string, permanent = false) {
  sendResponse(res, permanent ? 301 : 302, null, { Location: location });
}

/**
 * Returns the origin pf the request (<protocol>://<host>)
 */
export function baseUrl(req: IncomingMessage): string {
  return `${getProtocol(req)}://${req.headers.host}`;
}

/**
 * Returns the request scheme - "http" or "https"
 */
export function getProtocol(req: IncomingMessage): 'http' | 'https' {
  // Express has procotol or secure param on req
  if (req['protocol']) {
    return req['protocol'];
  }
  if (req.connection && req.connection['encrypted']) {
    return req.connection['encrypted'] ? 'https' : 'http';
  }
  return req.url.startsWith('https') ? 'https' : 'http';
}
