import Dexie from 'dexie'

export const db = new Dexie('stc');

// Declare tables, IDs and indexes
db.version(1).stores({
  bookmarks: 'nexus_key, anchor'
});
