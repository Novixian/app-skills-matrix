import * as Promise from 'bluebird';

import invitations from '../models/invitations';
import auth from '../models/auth';

const host = process.env.HOST;

export default (app) => {
  app.get('/invite/:token', (req, res, next) => {
    const { token } = req.params;
    Promise.try(() => invitations.getInvitationByToken(token))
      .then((invitation) => {
        if (!invitation) {
          // TODO: better experience? (shrug)
          return res.status(404).send('Invitation not found.');
        }
        res.cookie(auth.inviteCookieName, auth.sign({ token }));

        return res.redirect(`${host}/auth/github`);
      })
      .catch(next);

  });

  return app;
};
