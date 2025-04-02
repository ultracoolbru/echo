import { getUpcomingEvents } from './google';

(async () => {
  const events = await getUpcomingEvents();
  console.log('📅 Upcoming Events:', events.map(e => e.summary));
})();
