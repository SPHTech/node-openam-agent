"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
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
        formats = __spreadArrays(formats, [winston_1.format.prettyPrint()]);
    }
    if (options.json) {
        formats = __spreadArrays(formats, [winston_1.format.label({ label: id }), winston_1.format.json()]);
    }
    else {
        formats = __spreadArrays(formats, [
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