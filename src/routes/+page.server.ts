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
 
export const load = (async ({ cookies }) => {
  const user = {
    id: cookies.get('sessionid'),
    name: "pog"
  }
  return { user };
}) satisfies PageServerLoad;
 
export const actions = {
  login: async ({ cookies, request }) => {
    cookies.set('sessionid', "5");
    return { success: true };
  }
} satisfies Actions;