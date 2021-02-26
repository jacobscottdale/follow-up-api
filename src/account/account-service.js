const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const AccountService = {
  getAllAccounts(db) {
    return db.select('*').from('account');
  },

  createAccount(db, newAccount) {
    return db
      .insert(newAccount)
      .into('account')
      .returning('*')
      .then(([user]) => user);
  },

  getById(db, id) {
    return db.from('account').select('*').where('id', id).first();
  },

  deleteAccount(db, id) {
    return db('account')
      .where({ 'id': id })
      .delete();
  },

  updateAccount(db, id, newAccountFields) {
    return db('account')
      .where({ id })
      .update(newAccountFields);
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be fewer than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain at least 1 upper case, lower case, number and special character';
    }
    return null;
  },

  usernameInUse(db, username) {
    return db('account')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  serializeAccount(account) {
    return {
      id: account.id,
      first_name: account.first_name,
      last_name: account.last_name,
      username: account.username,
      date_created: new Date(account.created_on),
    };
  },

  hashPassword(password) {
    return bcrypt.hash(password, 10);
  },
};

module.exports = AccountService;