import * as Promise from 'bluebird';

import database from '../../database';
import { UnhydratedInvite } from './invitations';

const collection: any = database.collection('invitations');

collection.ensureIndex({ email: 1 }, { background: true });
collection.ensureIndex({ token: 1 }, { background: true });

type AddUser = {
  email: string,
  name: string,
  avatarUrl: string,
  username: string,
};

export default {
  saveInvite: (invite: UnhydratedInvite): Promise<any> => {
    return collection.updateOne({ email: invite.email }, { $set: invite }, { upsert: true });
  },
};
