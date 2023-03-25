import { redirect } from '@sveltejs/kit';

// Will redirect anything that is not /game/[gameId]
// to the default page. I just prefer this to error pages.
export function load() {
  throw redirect (308, '/');
}
