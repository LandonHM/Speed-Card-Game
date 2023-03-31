import type { PageServerLoad, Actions } from './$types';
import { WebSocket } from 'ws';
import { redirect } from '@sveltejs/kit';
import { json } from 'stream/consumers';

export const load = (async ({ cookies, params }) => {
  // Return host cookie and game lobby
  let message: Message;
  console.log('game load');
  //console.log(cookies.get('message'));
  //console.log(cookies.getAll());
  //console.log('game pao');
  try {
    message = JSON.parse(cookies.get('message')!);
    console.log('cookie have message');
    if( message.action == "pinghost" && message.lobbyname != params.gameId) {
      // Trying to host lobby
      console.log('trying to host lobby they didnt creat (deleting cookie)');
      //cookies.set('message', '');
      return;
    } else {
      console.log('returning messsge');
      return message;
    }
  } catch(e) {
    // json failed to parse = invalid message so set message to null
    console.log('cookie not have message');
    //cookies.set('message', '');
    return;
  }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ cookies, request }) => {
    console.log('connect called');
    const data = await request.formData();
    let message: Message = {
        action: "connect",
        user: String(data.get('username')),
        lobbyname: request.url.substring(request.url.lastIndexOf('/')+1),
        password: String(data.get('password')),
        message: '',
    }
    //console.log(message);
    // Message has no expiry so if you refresh in the game it will keep status
    cookies.set('message', JSON.stringify(message));
    return {success: true}
  }
} satisfies Actions;