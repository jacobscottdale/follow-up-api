const express = require('express');
const path = require('path');
const xss = require('xss')
const noteRouter = express.Router();
const bodyParser = express.json();
const NoteService = require('./note-service');

const serializeNote = note => {
  return {
    id: note.id,
    contact: note.contact,
    account: note.account,
    body: xss(note.body),
    created_on: new Date(note.created_on)
  }
}

noteRouter
  .route('/')
  .post( bodyParser, (req, res, next) => {
    const accountId = req.account.id;
    const { contact, body } = req.body;

    for (const field of ['contact', 'body'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });

    const newNote = {
      account: accountId,
      contact: contact,
      body: body
    };

    NoteService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note =>
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note))
      )
      .catch(next);
  });

noteRouter
  .route('/:noteId')
  .get((req, res, next) => {
    const noteId = req.params.noteId;
    const accountId = req.account.id;

    NoteService.getById(
      req.app.get('db'),
      noteId,
      accountId
    )
      .then(note => {
        if (!note)
          res
            .status(404)
            .json({
              error: { message: `Note with id '${noteId}' not found for this user` }
            });
        return res
          .status(200)
          .json(serializeNote(note));
      })
      .catch(next);

  })
  .delete((req, res, next) => {
    const noteId = req.params.noteId;
    const accountId = req.account.id;

    NoteService.deleteNote(
      req.app.get('db'),
      noteId,
      accountId
    )
      .then(note => {
        if (!note) {
          return res
            .status(404)
            .json({
              error: {
                message: `Note with id 'noteId' not found for this user`
              }
            });
        }
        return res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = noteRouter;