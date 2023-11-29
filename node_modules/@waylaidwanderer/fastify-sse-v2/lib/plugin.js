"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
const it_to_stream_1 = __importDefault(require("it-to-stream"));
const it_pushable_1 = __importDefault(require("it-pushable"));
const sse_1 = require("./sse");
const util_1 = require("./util");
// eslint-disable-next-line @typescript-eslint/require-await
const plugin = function (instance, options) {
    return __awaiter(this, void 0, void 0, function* () {
        instance.decorateReply("sse", function (source) {
            //if this already set, it's not first event
            if (!this.raw.headersSent) {
                this.sseContext = { source: (0, it_pushable_1.default)() };
                this.raw.setMaxListeners(Infinity);
                Object.entries(this.getHeaders()).forEach(([key, value]) => {
                    this.raw.setHeader(key, value !== null && value !== void 0 ? value : "");
                });
                this.raw.setHeader("Content-Type", "text/event-stream");
                this.raw.setHeader("Connection", "keep-alive");
                this.raw.setHeader("Cache-Control", "no-cache,no-transform");
                this.raw.setHeader("x-no-compression", 1);
                if (typeof options.retryDelay !== "undefined") {
                    this.raw.write((0, sse_1.serializeSSEEvent)({ retry: options.retryDelay || 3000 }));
                }
                handleAsyncIterable(this, this.sseContext.source);
            }
            if ((0, util_1.isAsyncIterable)(source)) {
                return handleAsyncIterable(this, source);
            }
            else {
                this.sseContext.source.push(source);
                return;
            }
        });
    });
};
exports.plugin = plugin;
function handleAsyncIterable(reply, source) {
    (0, it_to_stream_1.default)((0, sse_1.transformAsyncIterable)(source))
        .setMaxListeners(Infinity)
        .pipe(reply.raw);
}
