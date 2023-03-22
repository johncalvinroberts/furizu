/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * A stubbed implementation of the Worker API interface
 * Designed to be able to run on the server (Node or Deno) with no side effects and no off-limit apis.
 *
 * The entire API is  actually a noop, nothing runs.
 */
class StubWorker implements Worker {
	onmessage() {
		// noop
	}

	onerror() {
		// noop
	}

	onmessageerror() {
		// noop
	}

	terminate(): void {
		// noop
	}

	postMessage(message: unknown, options?: unknown): void {
		// noop
	}

	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions | undefined,
	): void {
		// noop
	}

	removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
		// noop
	}

	dispatchEvent(event: Event): boolean {
		return true;
	}
}

/**
 * Designed to be able to run on both server and the browser.
 * When run on the server it merely stubs the Worker API interface.
 */
const IsomorphicWorker = typeof window == "undefined" ? StubWorker : Worker;

export default IsomorphicWorker;

/* eslint-enable @typescript-eslint/no-unused-vars */
