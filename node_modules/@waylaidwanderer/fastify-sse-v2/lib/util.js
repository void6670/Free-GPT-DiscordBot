"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterable = void 0;
function isAsyncIterable(source) {
    if (source === null || source === undefined || typeof source !== "object") {
        return false;
    }
    return Symbol.asyncIterator in source;
}
exports.isAsyncIterable = isAsyncIterable;
