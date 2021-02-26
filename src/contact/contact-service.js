const ContactService = {
  getContacts(db, accountId) {
    return db
      .select(
        'c.id AS id',
        'c.account AS accountId',
        'c.first_name',
        'c.last_name',
        'c.company',
        'c.phone',
        'c.email',
        'a.application_date',
        'a.follow_up AS application_follow_up',
        'i.interview_date',
        'i.follow_up AS interview_follow_up',
        'ar.archive_date'
      )
      .from('contact AS c')
      .leftJoin('application AS a', { 'c.id': 'a.contact', 'c.account': 'a.account' })
      .leftJoin('interview AS i', { 'c.id': 'i.contact', 'c.account': 'i.account' })
      .leftJoin('archive AS ar', { 'c.id': 'ar.contact', 'c.account': 'ar.account' })
      .where({ 'c.account': accountId });
  },

  getByContactId(db, contactId, accountId) {
    return db
      .select(
        'c.id AS id',
        'c.account AS accountId',
        'c.first_name',
        'c.last_name',
        'c.company',
        'c.phone',
        'c.email',
        'a.application_date',
        'a.follow_up AS application_follow_up',
        'i.interview_date',
        'i.follow_up AS interview_follow_up',
        'ar.archive_date'
      )
      .from('contact AS c')
      .leftJoin('application AS a', { 'c.id': 'a.contact', 'c.account': 'a.account' })
      .leftJoin('interview AS i', { 'c.id': 'i.contact', 'c.account': 'i.account' })
      .leftJoin('archive AS ar', { 'c.id': 'ar.contact', 'c.account': 'ar.account' })
      .where({ 'c.account': accountId, 'c.id': contactId })
      .first();
  },

  insertContact(db, newContact) {
    return db
      .insert(newContact)
      .into('contact')
      .returning('*')
      .then(([contact]) => contact);
  },

  deleteContact(db, contactId, accountId) {
    return db('contact')
      .where({
        id: contactId,
        account: accountId
      })
      .delete();
  },



};

module.exports = ContactService;