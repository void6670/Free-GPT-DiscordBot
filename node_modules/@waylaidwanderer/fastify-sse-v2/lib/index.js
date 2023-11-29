"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifySSEPlugin = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const plugin_1 = require("./plugin");
exports.FastifySSEPlugin = (0, fastify_plugin_1.default)(plugin_1.plugin, {
    name: "fastify-sse-v2",
    fastify: ">=3",
});
exports.default = exports.FastifySSEPlugin;
