import * as R from 'ramda';

let sentEmails = {};

export const clearEmails = () => sentEmails = {};
export const getEmail = address => sentEmails[R.find<string>(e => e.indexOf(address) !== -1, R.keys(sentEmails))];

export default ({ recipients, subject, body }) => {
  sentEmails[recipients] = { subject, body };
  console.log(`sent email to ${recipients}. Subject: '${subject}'. Body: '${body}'`);
  return Promise.resolve({});
};
