import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { WebSocket } from 'ws';

export const load = (async ({ cookies }) => {
    console.log("load called");
    let result: string = cookies.get('result')!;
    if (result == 'true') {
        throw redirect(303, `/game/${cookies.get('lobbyname')}`);
    }
    return { error : cookies.get('error')};
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ cookies, request }) => {
    console.log('host called');
    let lobbyname: string;
    let password: string;

    const data = await request.formData();
    if(data.get('username') == '') {
        //console.log('nousername');
        cookies.set('error', 'Error: Username must be set', {maxAge: 5});
        cookies.set('result', 'false', {maxAge: 5});
        return { success: false};
    }

    if(data.get('lobbyname') == null) {
        lobbyname = Math.random().toString(16).substring(2, 10);
    } else {
        lobbyname = String(data.get('lobbyname'));
    }

    if(data.get('password') == null) {
        password = '';
    } else {
        password = String(data.get('password'));
    }

    let message = {
        action: "pinghost",
        user: (data.get('username')),
        lobbyname: lobbyname,
        password: password,
        id: crypto.randomUUID(),
    }

    //cookies.set('message', JSON.stringify(message));
    cookies.set('message', JSON.stringify(message), {maxAge: 60*60, path: '/game'});
    // lobby will expire after 5 seconds as its only used for error
    cookies.set('lobbyname', lobbyname, {maxAge: 5});
    let success: boolean;
    try {
        // Start websocket to server then ping to see if lobby is there
        let socket: WebSocket = new WebSocket("wss://kanji.help:1400");
        //let socket: WebSocket = new WebSocket("ws://localhost:1400");
        socket.onopen = () => socket.send(JSON.stringify(message));
        const result: string = await new Promise((resolve, _reject) => {
            // Wait for message from server
            let timeout = setTimeout(() => {
                //console.log('basdfklj');
                cookies.set('error', 'Error: Lobby server is currently down. Come back later.', {maxAge: 5})
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
                    cookies.set('error', 'Error: A Lobby with that name already exist. Please input a new lobbyname.', {maxAge: 5})
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
        cookies.set('error', String(e));
        return { success: false };
    }
  }
} satisfies Actions;