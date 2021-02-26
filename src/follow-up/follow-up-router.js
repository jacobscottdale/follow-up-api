const express = require('express');
const path = require('path');
const followUpRouter = express.Router();
const bodyParser = express.json();
const FollowUpService = require('./follow-up-service');
const xss = require('xss');

followUpRouter
  .route('/:contactId')
  .post(bodyParser, (req, res, next) => {
    const accountId = req.account.id;
    const { contactId } = req.params;
    const { tableToInsert, application_date, interview_date } = req.body;

    if (tableToInsert == 'interview') {
      FollowUpService.insertInterview(
        req.app.get('db'),
        accountId,
        contactId,
        interview_date
      )
        .then(interview => {
          if (!interview) {
            return res
              .status(404)
              .json({
                error: { message: `Contact with id ${contactId} associated with account ${accountId} not found` }
              });
          }
          return res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${interview.contact}`))
            .json(interview);
        })
        .catch(next);
    }

    else if (tableToInsert == 'application') {
      FollowUpService.insertApplication(
        req.app.get('db'),
        accountId,
        contactId,
        application_date
      )
        .then(application => {
          if (!application) {
            return res
              .status(404)
              .json({
                error: { message: `Contact with id ${contactId} associated with account ${accountId} not found` }
              });
          }
          return res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${application.contact}`))
            .json(application);
        })
        .catch(next);
    }

    else {
      return res
        .status(400)
        .json({
          error: { message: `Missing 'tableToInsert' on body. Must be 'archive' 'interview' or 'application'` }
        });
    }

  })
  .patch(bodyParser, (req, res, next) => {
    const accountId = req.account.id;
    const { contactId } = req.params;
    const { tableToUpdate } = req.body;

    if (tableToUpdate == 'interview') {
      FollowUpService.followedUpInterview(
        req.app.get('db'),
        accountId,
        contactId
      )
        .then(interview => {
          if (!interview) {
            return res
              .status(404)
              .json({
                error: { message: `Contact with id ${contactId} associated with account ${accountId} not found` }
              });
          }
          return res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${interview.contact}`))
            .json(interview);
        })
        .catch(next);
    }

    else if (tableToUpdate == 'application') {
      FollowUpService.followedUpApplication(
        req.app.get('db'),
        accountId,
        contactId
      )
        .then(application => {
          if (!application) {
            return res
              .status(404)
              .json({
                error: { message: `Contact with id ${contactId} associated with account ${accountId} not found` }
              });
          }
          return res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${application.contact}`))
            .json(application);
        })
        .catch(next);
    }

    else {
      return res
        .status(400)
        .json({
          error: { message: `Missing 'tableToInsert' on body. Must be 'archive' 'interview' or 'application'` }
        });
    }
  });

followUpRouter
  .route('/archive/:contactId')
  .post((req, res, next) => {

    const accountId = req.account.id;
    const { contactId } = req.params;

    FollowUpService.insertArchive(
      req.app.get('db'),
      accountId,
      contactId
    )
      .then(archive => {
        if (!archive) {
          return res
            .status(404)
            .json({
              error: { message: `Contact with id ${contactId} associated with account ${accountId} not found` }
            });
        }

        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${archive.contact}`))
          .json(archive);
      })
      .catch(next);

  })
  .delete((req, res, next) => {
    const accountId = req.account.id;
    const { contactId } = req.params;

    FollowUpService.deleteArchive(
      req.app.get('db'),
      accountId,
      contactId
    )
      .then(archive => {
        if (!archive) {
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

module.exports = followUpRouter;