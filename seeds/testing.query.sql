SELECT
  c.account,
  c.first_name,
  c.last_name,
  c.company,
  c.phone,
  c.email,
  a.application_date,
  a.follow_up AS application_follow_up,
  i.interview_date,
  i.follow_up AS interview_follow_up,
  ar.archive_date
FROM
  contact c
  LEFT JOIN application a ON c.id = a.contact
  AND c.account = a.account
  LEFT JOIN interview i ON c.id = i.contact
  AND c.account = i.account
  LEFT JOIN archive ar ON c.id = ar.contact
  AND c.account = ar.account
WHERE
  c.account = 1;