const express = require('express');
const { end } = require('../middleware/logger');
const logger = require('../middleware/logger');
const path = require('path');
const AccountService = require('./account-service');
const AuthService = require('../auth/auth-service');
const accountRouter = express.Router();
const bodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

accountRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    AccountService.getAllAccounts(req.app.get('db'))
      .then(accounts => {
        res.json(accounts);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { password, username, first_name, last_name } = req.body;

    for (const field of ['first_name', 'last_name', 'username', 'password'])
      if (!req.body[field])
        return res
        .status(400)
        .json({
          error: { message : `Missing '${field}' in request body` }
        });

    const passwordError = AccountService.validatePassword(password);

    if (passwordError)
      return res
      .status(400)
      .json({ 
        error: { message: passwordError } 
      });

    AccountService.usernameInUse(
      req.app.get('db'),
      username
    )
      .then(usernameInUse => {
        if (usernameInUse)
          return res.status(400).json({ error: `Username already taken` });
        return AccountService.hashPassword(password)
          .then(hashedPassword => {
            const newAccount = {
              first_name,
              last_name,
              username,
              password: hashedPassword,
              created_on: 'now()',
            };

            return AccountService.createAccount(
              req.app.get('db'),
              newAccount
            )
              .then(account => {
                return AuthService.getAccountWithUsername(
                  req.app.get('db'),
                  account.username
                )
                  .then(dbUser => {
                    if (!dbUser)
                      return res
                      .status(400)
                      .json({
                        error: { message: `Incorrect username or password` },
                      });
                    return AuthService.comparePasswords(
                      password, 
                      dbUser.password
                      )
                      .then(compareMatch => {
                        if (!compareMatch)
                          return res
                          .status(400)
                          .json({
                            error: { message: `Incorrect username or password` }
                          });
                        const sub = dbUser.username;
                        const payload = { user_id: dbUser.user_id };
                        res
                          .status(201)
                          .location(path.posix.join(req.originalUrl, `/${account.user_id}`))
                          .send({
                            authToken: AuthService.createJwt(sub, payload),
                          });
                      });
                  });
              });
          });
      })
      .catch(next);
  });

accountRouter
  .route('/:id')
  .get((req, res, next) => {
    AccountService.getById(
      req.app.get('db'), 
      req.params.id
      )
      .then(account => {
        if (!account) {
          return res
          .status(404)
          .json({
            error: { message: `Account doesn't exist` }
          });
        }
        res.json(account);
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    AccountService.getById(
      req.app.get('db'), 
      req.params.id
      )
      .then(account => {
        if (!account) {
          return res
          .status(404)
          .json({
            error: { message: `Account doesn't exist` }
          });
        } else {
          AccountService.deleteAccount(
            knexInstance, req.params.user_id
          )
            .then(res.status(204).end());
        }
      })
      .catch(next);
  });

module.exports = accountRouter;