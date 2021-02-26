const express = require('express');
const path = require('path');
const contactRouter = express.Router();
const bodyParser = express.json();

const ContactService = require('./contact-service');
const NoteService = require('../note/note-service');
const xss = require('xss');

const serializeContact = contact => {
  return {
    ...contact,
    first_name: xss(contact.first_name),
    last_name: xss(contact.last_name),
    company: xss(contact.company),
    phone: xss(contact.phone),
    email: xss(contact.email)
  };
};

const serializeNote = note => {
  return {
    id: note.id,
    body: xss(note.body),
    created_on: new Date(note.created_on)
  };
};

contactRouter
  .route('/')
  .get((req, res, next) => {
    const accountId = req.account.id;
    ContactService.getContacts(req.app.get('db'), accountId)
      .then(contacts => {
        return contacts.map(contact => serializeContact(contact));
      })
      .then(contacts =>
        res
          .status(200)
          .json(contacts))
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const accountId = req.account.id;
    const { first_name, last_name, company, phone, email } = req.body;
    if (!req.body.company)
      return res
        .status(400)
        .json({
          error: { message: `Missing 'Company' in request body` }
        });

    const newContact = {
      account: accountId,
      first_name,
      last_name,
      company,
      phone,
      email
    };

    ContactService.insertContact(
      req.app.get('db'),
      newContact
    )
      .then(contact => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${contact.id}`))
          .json(serializeContact(contact));
      })
      .catch(next);

  });

contactRouter
  .route('/:id')
  .get((req, res, next) => {
    const contactId = req.params.id;
    const accountId = req.account.id;

    ContactService.getByContactId(
      req.app.get('db'),
      contactId,
      accountId
    )
      .then(contact => {
        if (!contact) {
          return res
            .status(404)
            .json({
              error: {
                message: `Contact with id '${contactId}' not found for this user`
              }
            });
        }
        return serializeContact(contact);
      })
      .then(contact =>
        NoteService.getNotes(
          req.app.get('db'),
          contactId,
          accountId
        )
          .then(notes => {
            contact.notes = notes.map(note => serializeNote(note));
            return res
              .status(200)
              .send(contact);
          })
      )
      .catch(next);
  })


  .delete((req, res, next) => {
    const contactId = req.params.id;
    const accountId = req.account.id;
    ContactService.getByContactId(
      req.app.get('db'),
      contactId,
      accountId
    )
      .then(contact => {
        if (!contact) {
          return res
            .status(404)
            .json({
              error: {
                message: `Contact with id '${contactId}' not found for this user`
              }
            });
        }
        return res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = contactRouter;