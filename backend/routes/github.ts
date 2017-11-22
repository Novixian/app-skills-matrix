import * as authom from 'authom';
import { Application } from 'express';
import * as Promise from 'bluebird';

import auth from '../models/auth';
import users from '../models/users';
import invitations from '../models/invitations';
import { User } from '../models/users/user';
import { Invitation } from '../models/invitations/invitation';

authom.createServer({
  service: 'github',
  id: process.env.GITHUB_ID,
  secret: process.env.GITHUB_SECRET,
  scope: ['user:email'],
});

authom.on('auth', (req, res, { data }) => {
  const inviteCookie = req.cookies[auth.inviteCookieName];
  const inviteFunc = inviteCookie ?
    auth.verify(inviteCookie)
      .then(({ token }) => invitations.getInvitationByToken(token))
    : Promise.resolve(null);

  Promise.all([users.getUserByUsername(data.login), inviteFunc])
    .then(([user, invitation]: [User, Invitation]) => {
      const email = (invitation && invitation.email) || data.email;
      const githubData = { email, name: data.name, avatarUrl: data.avatar_url, username: data.login };
      const userFn: Promise<User> = !user ? users.addUser(githubData) : Promise.resolve(user);
      userFn.then(u => auth.sign(u.signingData()))
        .then((token) => {
          res.cookie(auth.cookieName, token);
          res.clearCookie(auth.inviteCookieName);
          res.redirect('/');
        })
        .catch(({ message, stack }) =>
          res.status(500).json({ message, stack }));
    });
});

authom.on('error', (req, res, data) => res.status(500).json(data));

export default (app: Application) => app.get('/auth/:service', authom.app) && app;
