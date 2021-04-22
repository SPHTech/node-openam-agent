/// <reference types="node" />
import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'http';
/**
 * Composes and sends an HTTP response
 */
export declare function sendResponse(res: ServerResponse, statusCode: number, body: string, headers: OutgoingHttpHeaders): void;
/**
 * Sends a redirect response
 */
export declare function redirect(res: ServerResponse, location: string, permanent?: boolean): void;
/**
 * Returns the origin pf the request (<protocol>://<host>)
 */
export declare function baseUrl(req: IncomingMessage): string;
/**
 * Returns the request scheme - "http" or "https"
 */
export declare function getProtocol(req: IncomingMessage): 'http' | 'https';
