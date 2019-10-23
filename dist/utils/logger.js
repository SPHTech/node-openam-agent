"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
var winston_1 = require("winston");
/**
 * Creates a new winston Logger with specific formatting
 * @example
 * var logger = createLogger('info', 'myLogger');
 * logger.info('hello world!');
 */
function createLogger(level, id, options) {
    if (level === void 0) { level = 'error'; }
    if (options === void 0) { options = {}; }
    var formats = [
        winston_1.format.timestamp()
    ];
    if (options.prettyPrint) {
        formats = formats.concat([winston_1.format.prettyPrint()]);
    }
    if (options.json) {
        formats = formats.concat([winston_1.format.label({ label: id }), winston_1.format.json()]);
    }
    else {
        formats = formats.concat([
            winston_1.format.label({ label: id, message: true }),
            winston_1.format.align(),
            winston_1.format.colorize(),
            winston_1.format.simple()
        ]);
    }
    return winston.createLogger({
        transports: [new winston_1.transports.Console({ level: level })],
        format: options.format || winston_1.format.combine.apply(winston_1.format, formats)
    });
}
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map