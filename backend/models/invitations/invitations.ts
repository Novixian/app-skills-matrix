import * as uuid from 'node-uuid';
import { Email } from '../../services/email/index';
import * as R from 'ramda';

const host = process.env.HOST;

export type UnhydratedInvitation = {
  email: string,
  token: string,
  date: Date,
};

const invite = (email): UnhydratedInvitation => ({ email, token: uuid.v4(), date: new Date() });

const invitations = (emails: string[]) => {
  const invites = emails.map(invite);

  return {
    invalidEmails: () => R.filter<string>(e => e.indexOf('@') === -1, emails), // This will only catch a very small subset of bad emails, but (shrug)
    getUserInvitations: () => invites,
    getInvitationEmails: (): Email[] => {
      return invites.map((invite) => {
        const recipients = invite.email;
        const subject = 'You have been invited to the SkillsMatrix';
        const body = `Please visit ${host}/invite/${invite.token} to activate your account.`;
        return { recipients, subject, body };
      });
    },
  };
};

export default invitations;
