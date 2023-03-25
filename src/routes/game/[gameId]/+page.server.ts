import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (({ cookies, params }) => {
  let message: Message = {
    action: "connect",
    user: String(cookies.get('user')),
    lobbyname: String(cookies.get('lobbyname')),
    password: String(cookies.get('password')),
    message: "",
  }
  cookies.delete('action');
  cookies.delete('user');
  cookies.delete('lobbyname');
  cookies.delete('password');

  return { message };
}) satisfies PageServerLoad;