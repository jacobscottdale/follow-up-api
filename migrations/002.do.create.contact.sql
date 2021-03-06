CREATE TABLE contact (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  account INTEGER REFERENCES account(id),
  first_name TEXT,
  last_name TEXT,
  company TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  CONSTRAINT email_phone_null CHECK (
    (phone IS NOT NULL)
    OR (email IS NOT NULL)
  )
);

CREATE TABLE note (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  account INTEGER REFERENCES account(id),
  contact INTEGER REFERENCES contact(id),
  body VARCHAR NOT NULL,
  created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE application (
  account INTEGER REFERENCES account(id),
  contact INTEGER REFERENCES contact(id),
  PRIMARY KEY (account, contact),
  application_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  follow_up BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE interview (
  account INTEGER REFERENCES account(id),
  contact INTEGER REFERENCES contact(id),
  PRIMARY KEY (account, contact),
  interview_date TIMESTAMPTZ NOT NULL,
  follow_up BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE archive (
  account INTEGER REFERENCES account(id),
  contact INTEGER REFERENCES contact(id),
  PRIMARY KEY (account, contact),
  archive_date TIMESTAMPTZ NOT NULL DEFAULT now()
);