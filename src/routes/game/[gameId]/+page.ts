import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params: {gameId} }) => {
  return { gameId };
}) satisfies PageLoad;