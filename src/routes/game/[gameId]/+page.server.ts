import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ cookies, params }) => {
  let message: Message;
  console.log('game load');
  try {
    message = JSON.parse(cookies.get('message')!);
    if( message.user == '') {
      message.user = message.id;
    }
    if( message.lobbyname != params.gameId) {
      return {lobby: params.gameId};
    } else {
      return message;
    }
  } catch(e) {
    return {lobby: params.gameId};
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
        password: data.get('password') == null ? "" : String(data.get('password')),
        id: crypto.randomUUID(),
    }
    // All cookies will expire in one hour 
    cookies.set('message', JSON.stringify(message), {maxAge: 60*60});
    return {success: true}
  }
} satisfies Actions;