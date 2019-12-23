"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Composes and sends an HTTP response
 */
function sendResponse(res, statusCode, body, headers) {
    res.writeHead(statusCode, headers);
    res.end(body);
}
exports.sendResponse = sendResponse;
/**
 * Sends a redirect response
 */
function redirect(res, location, permanent) {
    if (permanent === void 0) { permanent = false; }
    sendResponse(res, permanent ? 301 : 302, null, { Location: location });
}
exports.redirect = redirect;
/**
 * Returns the origin pf the request (<protocol>://<host>)
 */
function baseUrl(req) {
    return getProtocol(req) + "://" + req.headers.host;
}
exports.baseUrl = baseUrl;
/**
 * Returns the request scheme - "http" or "https"
 */
function getProtocol(req) {
    // Express has procotol or secure param on req
    if (req['protocol']) {
        return req['protocol'];
    }
    if (req.connection && req.connection['encrypted']) {
        return req.connection['encrypted'] ? 'https' : 'http';
    }
    return req.url.startsWith('https') ? 'https' : 'http';
}
exports.getProtocol = getProtocol;
//# sourceMappingURL=http-utils.js.map