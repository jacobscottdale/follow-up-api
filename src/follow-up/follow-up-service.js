const FollowUpService = {
  
  getApplication(db, account, contact) {
    return db
      .select('*')
      .from('application')
      .where({ account, contact });
  },

  getInterview(db, account, contact) {
    return db
      .select('*')
      .from('application')
      .where({ account, contact });
  },

  getArchive(db, account, contact) {
    return db
      .select('*')
      .from('archive')
      .where({ account, contact });
  },

  insertApplication(db, account, contact, application_date) {
    return db
      .insert({
        account,
        contact,
        application_date
      })
      .into('application')
      .returning('*')
      .then(([application]) => application);
  },

  insertInterview(db, account, contact, interview_date) {
    return db
      .insert({
        account,
        contact,
        interview_date
      })
      .into('interview')
      .returning('*')
      .then(([interview]) => interview);
  },

  insertArchive(db, account, contact) {
    return db
      .insert({
        account,
        contact
      })
      .into('archive')
      .returning('*')
      .then(([archive]) => archive);
  },

  followedUpApplication(db, account, contact) {
    return db('application')
      .where({ account, contact })
      .update('follow_up', true)
      .returning('*')
      .then(([followedUp]) => followedUp)
      
  },

  followedUpInterview(db, account, contact) {
    return db('interview')
      .where({ account, contact })
      .update('follow_up', true);
  },

  deleteArchive(db, account, contact) {
    return db('archive')
      .where({ account, contact })
      .delete();
  },

};

module.exports = FollowUpService;