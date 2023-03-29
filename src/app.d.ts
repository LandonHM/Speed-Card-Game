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
		action: String;
		user: String;
		lobbyname: String;
		password: String;
		message: String;
	}

	interface ServerMessage {
		action: String;
		user: String;
		message: String;
	}
}

export {};
