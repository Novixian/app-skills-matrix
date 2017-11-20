import * as uuid from 'node-uuid';
import { Email } from '../../services/email/index';

const host = process.env.HOST;

export type UnhydratedInvite = {
  email: string,
  token: string,
  date: Date,
};

const invite = (email): UnhydratedInvite => ({ email, token: uuid.v4(), date: new Date() });

const invitations = (emails: string[]) => {
  const invites = emails.map(invite);

  return {
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
