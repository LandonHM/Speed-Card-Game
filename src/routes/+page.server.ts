import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { WebSocket } from 'ws';

export const load = (async ({ cookies }) => {
    console.log("load called");
    let result: string = cookies.get('result')!;
    if (result == 'true') {
        throw redirect(303, `/game/${cookies.get('lobbyname')}`);
    } else if (result == 'false') {
        return {
            lobbyname: cookies.get('lobbyname'),
            host: cookies.get('host'),
            error: null
        }
    } else {
        return {
            error: "The server is down, cannot play right now. :("
        }
    }
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ cookies, request }) => {
    console.log('host called');
    const data = await request.formData();
    let message: Message = {
        action: "pinghost",
        user: String(data.get('username')),
        lobbyname: String(data.get('lobbyname')),
        password: String(data.get('password')),
        message: crypto.randomUUID(),
    }
    // Message has no expiry so if you refresh in the game it will keep status
    cookies.set('message', JSON.stringify(message));
    // lobby will expire after 5 seconds as its only used for error
    cookies.set('lobbyname', String(message.lobbyname), {maxAge: 5});
    let success: boolean;
    try {
        // Start websocket to server then ping to see if lobby is there
        let socket: WebSocket = new WebSocket("ws://localhost:1400");
        socket.onopen = () => socket.send(JSON.stringify(message));
        const result: string = await new Promise((resolve, _reject) => {
            // Wait for message from server
            let timeout = setTimeout(() => {
                //console.log('basdfklj');
                resolve('error')
            }, 3000);
            socket.onmessage = (sm) => {
                clearTimeout(timeout);
                if(JSON.parse(String(sm.data)).message == "lobby available"){
                    console.log('hi');
                    cookies.set('result', 'true', {maxAge: 5});
                    socket.close()
                    resolve('true');
                } else {
                    console.log('bye');
                    cookies.set('result', 'false', {maxAge: 5});
                    socket.close()
                    resolve('false');
                }
            }
        });
        cookies.set('result', result, {maxAge: 5});
        console.log('here and res: ' + result);
        return { success : result == 'true'}
        
    } catch (e) {
        console.log(e);
        cookies.set('result', 'false', {maxAge: 5});
        return { success: false };
    }
  }
} satisfies Actions;