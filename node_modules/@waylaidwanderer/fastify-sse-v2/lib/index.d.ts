import { Pushable } from "it-pushable";
export declare const FastifySSEPlugin: import("fastify").FastifyPluginAsync<import("./types").SsePluginOptions, import("fastify").RawServerDefault, import("fastify").FastifyTypeProviderDefault>;
export default FastifySSEPlugin;
declare module "fastify" {
    interface EventMessage {
        /**
         * Message payload
         */
        data?: string;
        /**
         * Message identifier, if set, client will send `Last-Event-ID: <id>` header on reconnect
         */
        id?: string;
        /**
         * Message type
         */
        event?: string;
        /**
         * Update client reconnect interval (how long will client wait before trying to reconnect).
         */
        retry?: number;
    }
    interface FastifyReply {
        sseContext: {
            source: Pushable<EventMessage>;
        };
        sse(source: AsyncIterable<EventMessage> | EventMessage): void;
    }
}
export interface EventMessage {
    /**
     * Message payload
     */
    data?: string;
    /**
     * Message identifier, if set, client will send `Last-Event-ID: <id>` header on reconnect
     */
    id?: string;
    /**
     * Message type
     */
    event?: string;
    /**
     * Update client reconnect interval (how long will client wait before trying to reconnect).
     */
    retry?: number;
}
