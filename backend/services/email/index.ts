import mailgun from './mailgun';
import ses from './ses';
import stub from './stub';

export type Email = {
  recipients: string | string[],
  subject: string,
  body: string,
};

const MAIL_PROVIDER = process.env.MAIL_PROVIDER || 'stub';

const providers = {
  mailgun,
  ses,
  stub,
};

export default ({ recipients, subject, body }: Email): Promise<{}> => {
  const emailProviderSendMailFn = providers[MAIL_PROVIDER];
  if (!emailProviderSendMailFn) {
    console.log('Not sending an email!');
    return Promise.resolve({});
  }

  return emailProviderSendMailFn({ recipients, subject, body }).catch(console.error);
};
