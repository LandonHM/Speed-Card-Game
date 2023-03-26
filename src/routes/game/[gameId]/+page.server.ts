import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies, params }) => {
  let message: Message|null;
  if(cookies.get('message') != undefined){
    message = JSON.parse(cookies.get('message')!);
    cookies.delete('message');
  } else {
    // will get from param options if not from cookie to allow no js things.
    message = null;
  }

  return message;
}) satisfies PageServerLoad;