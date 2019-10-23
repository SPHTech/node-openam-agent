"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promisify = require("util.promisify");
var xml2js_1 = require("xml2js");
function parseXml(doc) {
    var parser = new xml2js_1.Parser();
    var parseString = promisify(parser.parseString);
    return parseString(doc);
}
exports.parseXml = parseXml;
//# sourceMappingURL=xml-utils.js.map