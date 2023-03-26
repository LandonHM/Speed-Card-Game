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
    // redirect code may need adjusting
    throw redirect (303, `/game/${cookies.get('lobbyname')}`);
  }else{
    return {
        lobbyname: cookies.get('lobbyname')
    }
  }
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    let message: Message = {
        action: "ping",
        user: String(data.get('username')),
        lobbyname: String(data.get('lobbyname')),
        password: String(data.get('password')),
        message: '',
    }
    // Message has no expiry so if you refresh in the game it will keep status
    cookies.set('message', JSON.stringify(message));
    // lobby will expire after 5 seconds as its only used for error
    cookies.set('lobbyname', String(message.lobbyname), {maxAge: 5});
    let success: boolean = true;
    if(success){
        // result will expire to prevent redirect if user want to join a new lobby
        cookies.set('result', 'true', {maxAge: 5});
        return { success: true };
    }else{
        // result will expire to prevent redirect if user want to join a new lobby
        cookies.set('result', 'false', {maxAge: 5});
        return { success: false };
    }
  }
} satisfies Actions;
