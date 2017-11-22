import * as Promise from 'bluebird';

import database from '../../database';
import { UnhydratedInvitation } from './invitations';
import invitation, { Invitation } from './invitation';

const collection: any = database.collection('invitations');

collection.ensureIndex({ email: 1 }, { background: true });
collection.ensureIndex({ token: 1 }, { background: true });

export default {
  saveInvite: (invite: UnhydratedInvitation): Promise<any> => {
    return collection.updateOne({ email: invite.email }, { $set: invite }, { upsert: true });
  },
  getInvitationByToken: (token: string): Promise<Invitation> => {
    return collection.findOne({ token })
      .then(res => res ? invitation(res) : null);
  },
};
