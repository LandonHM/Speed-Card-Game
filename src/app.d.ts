// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	interface CardData {
		id: number;
		flipped: boolean;
		front: string;
		back: string;
	}

	interface Message {
		action: string;
		user: string;
		lobbyname: string;
		password: string;
		id: string;
	}

	interface ServerMessage {
		action: string;
		user: string;
		message: string;
	}
}

export {};
