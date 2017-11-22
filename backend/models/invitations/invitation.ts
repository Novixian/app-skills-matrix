import { UnhydratedInvitation } from './invitations';

export type Invitation = {
  email: string,
};

// placeholder for future functionality
const invitation = ({ token, email, date }: UnhydratedInvitation): Invitation => ({
  email,
});

export default invitation;
