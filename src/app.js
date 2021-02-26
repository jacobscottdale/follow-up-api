require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const authRouter = require('./auth/auth-router');
const accountRouter = require('./account/account-router');
const contactRouter = require('./contact/contact-router');
const noteRouter = require('./note/note-router');
const followUpRouter = require('./follow-up/follow-up-router');
const errorHandler = require('./middleware/error-handler');
const { requireAuth } = require('./middleware/jwt-auth')

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors({
  origin: CLIENT_ORIGIN
}));

app.use('/api/account', accountRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', requireAuth, contactRouter);
app.use('/api/note', requireAuth, noteRouter);
app.use('/api/follow-up', requireAuth, followUpRouter);

app.get('/api', (req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

module.exports = app;