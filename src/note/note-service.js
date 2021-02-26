const NoteService = {
  getNotes(db, contactId, accountId) {
    return db
      .from('note')
      .select('*')
      .where({
        contact: contactId,
        account: accountId
      });
  },

  insertNote(db, newNote) {
    return db
      .insert(newNote)
      .into('note')
      .returning('*')
      .then(([note]) => note);
  },

  getById(db, noteId, accountId) {
    return db
      .from('note')
      .select('*')
      .where({
        id: noteId,
        account: accountId
      })
      .first();
  },

  deleteNote(db, noteId, accountId) {
    return db('note')
      .where({
        id: noteId,
        account: accountId
      })
      .delete();
  },

};

module.exports = NoteService;