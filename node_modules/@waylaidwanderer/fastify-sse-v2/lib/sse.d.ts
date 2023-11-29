import { EventMessage } from "fastify";
export declare function transformAsyncIterable(source: AsyncIterable<EventMessage>): AsyncIterable<string>;
export declare function serializeSSEEvent(chunk: EventMessage): string;
