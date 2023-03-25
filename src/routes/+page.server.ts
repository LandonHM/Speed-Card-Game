/*import type { PageServerLoad, Actions } from "./$types";
//import type { Actions } from "./$types";
import { redirect } from '@sveltejs/kit';
import { WebSocket } from 'ws';

// dont think i need this as this page will never load data
export const load = (async ({cookies}) => {
    if(cookies.get("valid") == "true"){
                    // then redirect to the game
        return redirect(307,"/game/"+cookies.get("lobbyname"));
    }
    //console.log(cookies.get('id'));
}) satisfies PageServerLoad;

export const actions = {
    login: async ({cookies, request}) => {
        const data = await request.formData();
        let m: Message = {
            action: "ping",
            user: String(data.get('username')),
            lobbyname: String(data.get('lobbyname')),
            password: String(data.get('password')),
            message: '',
        }
        //console.log("message: " + m);
        try {
            let socket: WebSocket = new WebSocket("ws://localhost:1400");
            socket.onopen = () => socket.send(JSON.stringify(m));
            socket.onmessage = (sm) => {
                console.log(sm);
                if(JSON.parse(String(sm.data)).message == "valid lobby"){
                    // first set cookies
                    cookies.set("valid", "true");
                    cookies.set("lobbyname", String(m.lobbyname));
                    cookies.set("game", JSON.stringify(m));
                    // then redirect to the game
                    return { success: true}
                    //return redirect(307,"/game/"+m.lobbyname);
                } else {
                    console.log('error lobby not found');
                    return {  error: "error" };
                }
            }
        } catch(e) {
            console.log(e);
        }
    }
} satisfies Actions; */

import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies }) => {
  if(cookies.get('result') == 'true') {
    throw redirect (301, `/game/${cookies.get('lobbyname')}`);
  }else{
    return {
        lobbyname: cookies.get('lobbyname')
    }
  }
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ cookies, request }) => {
    const data = await request.formData();
    let message: Message = {
        action: "ping",
        user: String(data.get('username')),
        lobbyname: String(data.get('lobbyname')),
        password: String(data.get('password')),
        message: '',
    }
    cookies.set('action', String(message.action));
    cookies.set('user', String(message.user));
    cookies.set('lobbyname', String(message.lobbyname));
    cookies.set('password', String(message.password));
    let success: boolean = true;
    if(success){
        cookies.set('result', 'true');
        return { success: true };
    }else{
        cookies.set('result', 'false');
        return { success: false };
    }
  }
} satisfies Actions;
