import * as winston from 'winston';
export interface LoggerOptions {
    json?: boolean;
    prettyPrint?: boolean;
    format?: any;
}
/**
 * Creates a new winston Logger with specific formatting
 * @example
 * var logger = createLogger('info', 'myLogger');
 * logger.info('hello world!');
 */
export declare function createLogger(level?: string, id?: string, options?: LoggerOptions): winston.Logger;
