import type { PageServerLoad, Actions } from './$types';
import { WebSocket } from 'ws';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies, params }) => {
  let message: Message|null;
  if(cookies.get('message') != undefined){
    message = JSON.parse(cookies.get('message')!);
    /*if(message!.lobbyname != params.gameId) {
      
      throw redirect(303, '/');
    }*/
  } else {
    message = null;
  }

  return message;
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ cookies, request }) => {
    console.log('connect called');
    cookies.set('host', 'false');
    const data = await request.formData();
    let message: Message = {
        action: "ping",
        user: String(data.get('username')),
        lobbyname: request.url.substring(request.url.lastIndexOf('/')+1),
        password: String(data.get('password')),
        message: '',
    }
    console.log(message);
    // Message has no expiry so if you refresh in the game it will keep status
    cookies.set('message', JSON.stringify(message));
    // lobby will expire after 5 seconds as its only used for error
    cookies.set('lobbyname', String(message.lobbyname), {maxAge: 5});
    try {
        // Start websocket to server then ping to see if lobby is there
        let socket: WebSocket = new WebSocket("ws://localhost:1400");
        socket.onopen = () => socket.send(JSON.stringify(message));
        const result: string = await new Promise((resolve, _reject) => {
            let timeout = setTimeout(() => {
                console.log('basdfklj');
                resolve('error')
            }, 3000);
            // Wait for message from server
            socket.onmessage = (sm) => {
                clearTimeout(timeout);
                if(JSON.parse(String(sm.data)).message == "valid lobby"){
                    console.log('TRY TO SET COOKIEa');
                    cookies.set('result', 'true', {maxAge: 5});
                    socket.close()
                    resolve('true');
                } else {
                    console.log('TRY TO SET COOKIEa');
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
        cookies.set('result', 'false', {maxAge: 5});
        return { success: false };
    }

  }
} satisfies Actions;