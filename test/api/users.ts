import * as request from 'supertest';
import { expect } from 'chai';
import { ObjectID } from 'mongodb';

import fixtureUsers from '../fixtures/users';
import app from '../../backend/app';
import helpers from '../helpers';
import templateFixture from '../fixtures/templates';
import auth from '../../backend/models/auth';
import evaluationsFixture from '../fixtures/evaluations';
import { clearEmails, getEmail } from '../../backend/services/email/stub';
import { INVALID_INVITES, MUST_BE_ADMIN } from '../../backend/handlers/errors';

const { dmorgantini, magic } = fixtureUsers;
const [evaluationOne, evaluationTwo] = evaluationsFixture;
const { sign, cookieName } = auth;
const { prepopulateUsers, users, insertEvaluation, insertTemplate, getEvaluationsByUser, clearDb, invitations } = helpers;
const [sampleTemplate] = templateFixture;

const prefix = '/skillz';

const templateId = 'eng-nodejs';

const normalUserToken = sign({ username: magic.username, id: magic._id.toString() });
const normalUserId = magic._id.toString();
const adminToken = sign({ username: dmorgantini.username, id: dmorgantini._id.toString() });
const adminUserId = String(dmorgantini._id);

describe('users', () => {
  beforeEach(() =>
    clearDb()
      .then(clearEmails)
      .then(prepopulateUsers));

  describe('POST /users { action: create }', () => {
    it('should let admin create users', () =>
      request(app)
        .post(`${prefix}/users`)
        .send({ username: 'newuser', email: 'newuser@user.com', name: 'new name', action: 'create' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(201)
        .then(res => users.findOne({ email: res.body.email }))
        .then((newUser) => {
          expect(newUser.email).to.equal('newuser@user.com');
          expect(newUser.name).to.equal('new name');
        }));

    [
      () => ({
        desc: 'not authorized',
        token: normalUserToken,
        body: { username: 'newuser', email: 'newuser@user.com', name: 'new name', action: 'create' },
        expect: 403,
      }),
      () => ({
        desc: 'conflict',
        token: adminToken,
        body: { username: 'magic', email: 'user@magic.com', name: 'new name', action: 'create' },
        expect: 409,
      }),
      () => ({
        desc: 'bad action',
        token: adminToken,
        body: { username: 'newuser', email: 'user@magic.com', name: 'new name', action: 'foo' },
        expect: 400,
      }),
    ].forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/users`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });

  describe('POST /users { action: inviteUsers }', () => {
    const normalUserInvite = 'invite@user.com';
    const multiUserInvite = 'invite1@user.com invite2@user.com';
    it('should let admin invite a user and send an email', () =>
      request(app)
        .post(`${prefix}/users`)
        .send({ users: normalUserInvite, action: 'inviteUsers' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(204)
        .then(() => invitations.findOne({ email: normalUserInvite }))
        .then((invitation) => {
          expect(invitation.email).to.equal(normalUserInvite);
          expect(invitation.token).to.not.be.null;
          expect(invitation.date).to.not.be.null;
        })
        .then(() => expect(getEmail(normalUserInvite)).to.not.be.null));

    it('should let admin invite multiple users', () =>
      request(app)
        .post(`${prefix}/users`)
        .send({ users: multiUserInvite, action: 'inviteUsers' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(204)
        .then(() => invitations.find({}))
        .then(res => res.toArray())
        .then((invitations) => {
          expect(invitations.length).to.equal(2);
        })
        .then(() => {
          expect(getEmail('invite1@user.com')).to.not.be.null;
          expect(getEmail('invite2@user.com')).to.not.be.null;
        }));

    [
      () => ({
        desc: 'not authorized',
        token: normalUserToken,
        body: { users: normalUserInvite, action: 'inviteUsers' },
        expect: 403,
        error: MUST_BE_ADMIN(),
      }),
      () => ({
        desc: 'invalid email address',
        token: adminToken,
        body: { users: 'notanemail', action: 'inviteUsers' },
        expect: 400,
        error: INVALID_INVITES('notanemail'),
      }),
    ].forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/users`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)
          .then(res => expect(res.body).to.deep.equal(test().error))));
  });

  describe('POST /users/:userId { action: selectMentor }', () => {
    it('should let admin select a mentor', () =>
      request(app)
        .post(`${prefix}/users/${normalUserId}`)
        .send({ mentorId: adminUserId, action: 'selectMentor' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(200)
        .then(() => users.findOne({ _id: new ObjectID(normalUserId) }))
        .then((updatedUser) => {
          expect(updatedUser.mentorId).to.equal(adminUserId.toString());
        }));

    [
      () => ({
        desc: 'not authorized',
        token: normalUserToken,
        body: { mentorId: adminUserId, action: 'selectMentor' },
        userId: normalUserId,
        expect: 403,
      }),
      () => ({
        desc: 'no user',
        token: adminToken,
        body: { mentorId: adminUserId, action: 'selectMentor' },
        userId: '58a237c185b8790720deb924',
        expect: 404,
      }),
      () => ({
        desc: 'bad action',
        token: adminToken,
        body: { mentorId: adminUserId, action: 'foo' },
        userId: normalUserId,
        expect: 400,
      }),
      () => ({
        desc: 'can not mentor themselves',
        token: adminToken,
        body: { mentorId: normalUserId, action: 'selectMentor' },
        userId: normalUserId,
        expect: 400,
      }),
    ].forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/users/${test().userId}`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });

  describe('POST /users/:userId { action: selectLineManager }', () => {
    it('should let admin select a lineManager', () =>
      request(app)
        .post(`${prefix}/users/${normalUserId}`)
        .send({ lineManagerId: adminUserId, action: 'selectLineManager' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(200)
        .then(() => users.findOne({ _id: new ObjectID(normalUserId) }))
        .then((updatedUser) => {
          expect(updatedUser.lineManagerId).to.equal(adminUserId.toString());
        }));

    [
      () => ({
        desc: 'not authorized',
        token: normalUserToken,
        body: { lineManagerId: adminUserId, action: 'selectLineManager' },
        userId: normalUserId,
        expect: 403,
      }),
      () => ({
        desc: 'no user',
        token: adminToken,
        body: { lineManagerId: adminUserId, action: 'selectLineManager' },
        userId: '58a237c185b8790720deb924',
        expect: 404,
      }),
      () => ({
        desc: 'bad action',
        token: adminToken,
        body: { lineManagerId: adminUserId, action: 'foo' },
        userId: normalUserId,
        expect: 400,
      }),
      () => ({
        desc: 'can not mentor themselves',
        token: adminToken,
        body: { lineManagerId: normalUserId, action: 'selectLineManager' },
        userId: normalUserId,
        expect: 400,
      }),
    ].forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/users/${test().userId}`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });

  describe('POST /users/:userId { action: selectTemplate }', () => {
    it('should let admin select a template for a user', () =>
      insertTemplate(sampleTemplate)
        .then(() =>
          request(app)
            .post(`${prefix}/users/${normalUserId}`)
            .send({ templateId, action: 'selectTemplate' })
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(200))
        .then(() => users.findOne({ _id: new ObjectID(normalUserId) }))
        .then((updatedUser) => {
          expect(updatedUser.templateId).to.equal(templateId);
        }));

    [
      () => ({
        desc: 'not authorized',
        token: normalUserToken,
        body: { templateId, action: 'selectTemplate' },
        userId: normalUserId,
        expect: 403,
      }),
      () => ({
        desc: 'no user',
        token: adminToken,
        body: { templateId, action: 'selectTemplate' },
        userId: '58a237c185b8790720deb924',
        expect: 404,
      }),
      () => ({
        desc: 'template not found',
        token: adminToken,
        body: { templateId: 'does-not-exist-lolz', action: 'selectTemplate' },
        userId: normalUserId,
        expect: 400,
      }),
    ].forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/users/${test().userId}`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });

  describe('POST /users/:userId { action: updateUserDetails }', () => {
    it('allows an admin to update the details of a user', () =>
      request(app)
        .post(`${prefix}/users/${normalUserId}`)
        .send({ name: 'UPDATED_NAME', email: 'updated@email.com', action: 'updateUserDetails' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(200)
        .then(() => users.findOne({ _id: new ObjectID(normalUserId) }))
        .then((updatedUser) => {
          expect(updatedUser.username).to.equal('magic');
          expect(updatedUser.name).to.equal('UPDATED_NAME');
          expect(updatedUser.email).to.equal('updated@email.com');
        }));


    it('updates user details for all of the evaluations that exist for a user', () =>
      Promise.all([
        insertEvaluation(evaluationOne, normalUserId, 'OLD_NAME', 'old@email.com'),
        insertEvaluation(evaluationTwo, normalUserId, 'OLD_NAME', 'old@email.com'),
      ])
        .then(() =>
          request(app)
            .post(`${prefix}/users/${normalUserId}`)
            .send({ name: 'UPDATED_NAME', email: 'updated@email.com', action: 'updateUserDetails' })
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(200))
        .then(() => getEvaluationsByUser(normalUserId))
        .then((evaluations) => {
          expect(evaluations).to.have.length(2);
          const [evalOne, evalTwo] = evaluations;

          expect(evalOne.user.id).to.equal(normalUserId);
          expect(evalOne.user.name).to.equal('UPDATED_NAME');
          expect(evalOne.user.email).to.equal('updated@email.com');

          expect(evalTwo.user.id).to.equal(normalUserId);
          expect(evalOne.user.name).to.equal('UPDATED_NAME');
          expect(evalOne.user.email).to.equal('updated@email.com');
        }));

    it('only updates the evaluations of the user having their details updated', () =>
      Promise.all([
        insertEvaluation(evaluationOne, normalUserId, 'OLD_NAME', 'old@email.com'),
        insertEvaluation(evaluationTwo, adminUserId, 'OLD_NAME', 'old@email.com'),
      ])
        .then(() =>
          request(app)
            .post(`${prefix}/users/${normalUserId}`)
            .send({ name: 'UPDATED_NAME', email: 'updated@email.com', action: 'updateUserDetails' })
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(200))
        .then(() => Promise.all([getEvaluationsByUser(normalUserId), getEvaluationsByUser(adminUserId)]))
        .then(([normalUserEvals, adminUserEvals]) => {
          expect(normalUserEvals).to.have.length(1);
          expect(adminUserEvals).to.have.length(1);

          const [normalUserEval] = normalUserEvals;
          const [adminUserEval] = adminUserEvals;

          expect(normalUserEval.user.name).to.equal('UPDATED_NAME');
          expect(normalUserEval.user.email).to.equal('updated@email.com');

          expect(adminUserEval.user.name).to.equal('OLD_NAME');
          expect(adminUserEval.user.email).to.equal('old@email.com');
        }));

    it('allows an admin to update their own details', () =>
      request(app)
        .post(`${prefix}/users/${adminUserId}`)
        .send({ name: 'UPDATED_NAME', email: 'updated@email.com', action: 'updateUserDetails' })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(200)
        .then(() => users.findOne({ _id: new ObjectID(adminUserId) }))
        .then((updatedUser) => {
          expect(updatedUser.username).to.equal('dmorgantini');
          expect(updatedUser.name).to.equal('UPDATED_NAME');
          expect(updatedUser.email).to.equal('updated@email.com');
        }));

    it('allows updates for a user that does not have existing values for the fields being updated', () =>
      users.update({ _id: new ObjectID(normalUserId) }, { $unset: { name: '', email: '' } })
        .then(() =>
          request(app)
            .post(`${prefix}/users/${normalUserId}`)
            .send({ name: 'NEW_NAME', email: 'new@email.com', action: 'updateUserDetails' })
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(200))
        .then(() => users.findOne({ _id: new ObjectID(normalUserId) }))
        .then((updatedUser) => {
          expect(updatedUser.username).to.equal('magic');
          expect(updatedUser.name).to.equal('NEW_NAME');
          expect(updatedUser.email).to.equal('new@email.com');
        }));

    it('returns not authorised when the user is not logged in', () =>
      users.findOne({ _id: new ObjectID(normalUserId) })
        .then(() =>
          request(app)
            .post(`${prefix}/users/${normalUserId}`)
            .send({ name: 'NEW_NAME', email: 'new@email.com', action: 'updateUserDetails' })
            .expect(401)));

    [
      () => ({
        desc: 'missing user',
        token: adminToken,
        body: { name: 'NEW_NAME', email: 'valid@email.com', action: 'updateUserDetails' },
        userId: 'MISSING_USER',
        expect: 404,
      }),
      () => ({
        desc: 'invalid action',
        token: adminToken,
        body: { name: 'NEW_NAME', email: 'valid@email.com', action: 'INVALID' },
        userId: normalUserId,
        expect: 400,
      }),
      () => ({
        desc: 'name/email missing from request',
        token: adminToken,
        body: { name: 'NEW_NAME', action: 'updateUserDetails' },
        userId: normalUserId,
        expect: 400,
      }),
      () => ({
        desc: 'invalid email address',
        token: adminToken,
        body: { name: 'NEW_NAME', email: 'INVALID', action: 'updateUserDetails' },
        userId: normalUserId,
        expect: 400,
      }),
      () => ({
        desc: 'invalid name',
        token: adminToken,
        body: { name: '', email: 'valid@email.com', action: 'updateUserDetails' },
        userId: normalUserId,
        expect: 400,
      }),
      () => ({
        desc: 'user not admin',
        token: normalUserToken,
        body: { name: 'NEW_NAME', email: 'new@email.com', action: 'updateUserDetails' },
        userId: normalUserId,
        expect: 403,
      }),
    ].forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/users/${test().userId}`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));

  });
});
