import * as request from 'supertest';
import { expect } from 'chai';
import * as Promise from 'bluebird';
import * as R from 'ramda';

import fixtureUsers from '../fixtures/users';
import app from '../../backend/app';
import auth from '../../backend/models/auth';
import helpers from '../helpers';
import templateFixture from '../fixtures/templates';
import skillsFixture from '../fixtures/skills';

const { templates, skills, prepopulateUsers, insertTemplate, insertSkill, clearDb } = helpers;
const { dmorgantini, magic } = fixtureUsers;
const { sign, cookieName } = auth;
const [sampleTemplate] = templateFixture;
const [sampleSkill] = skillsFixture;

const prefix = '/skillz/matrices';
const normalUserToken = sign({ username: magic.username, id: magic._id.toString() });
const adminToken = sign({ username: dmorgantini.username, id: dmorgantini._id.toString() });

describe('matrices', () => {
  beforeEach(() =>
    clearDb()
      .then(prepopulateUsers));

  describe('GET /matrices/template', () => {
    it('gets the template by id', () => insertTemplate(Object.assign({}, sampleTemplate))
      .then(() =>
        request(app)
          .get(`${prefix}/templates/${sampleTemplate.id}`)
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(({ body }) => {
            expect(body.name).to.equal('Node JS Dev');
            expect(body.skillGroups[0].category).to.equal('Dragon Slaying');
          })));

    const errorCases =
      [
        () => ({
          desc: 'not authorized',
          token: normalUserToken,
          id: sampleTemplate.id,
          expect: 403,
        }),
        () => ({
          desc: 'no template',
          token: adminToken,
          id: 'lolz-lolz',
          expect: 404,
        }),
      ];

    errorCases.forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .get(`${prefix}/templates/${test().id}`)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });

  describe('POST /matrices/templates', () => {
    it('permits saving of new templates by admin users', () =>
      request(app)
        .post(`${prefix}/templates`)
        .send({ action: 'save', template: sampleTemplate })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(201)
        .then(() => templates.findOne({ id: 'eng-nodejs' }))
        .then((newTemplate) => {
          expect(newTemplate.name).to.equal('Node JS Dev');
          expect(newTemplate.skillGroups[0].category).to.equal('Dragon Slaying');
        }));

    it('returns bad request when a template exists with the same ID', () =>
      insertTemplate(Object.assign({}, sampleTemplate))
        .then(() =>
          request(app)
            .post(`${prefix}/templates`)
            .send({
              action: 'save',
              template: Object.assign({}, sampleTemplate, { name: 'new name', skillGroups: [] }),
            })
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(400)));

    it('responds with bad request when data to be saved is not valid', () => {
      const invalidTemplate = {
        id: null,
        name: '',
        categories: 'INVALID',
        levels: { invalid: true },
      };

      return request(app)
        .post(`${prefix}/templates`)
        .send({ action: 'save', template: invalidTemplate })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(400);
    });

    const errorCases =
      [
        () => ({
          desc: 'not authorized',
          token: normalUserToken,
          body: { action: 'create', template: {} },
          expect: 403,
        }),
        () => ({
          desc: 'bad action',
          token: adminToken,
          body: { action: 'foo', template: {} },
          expect: 400,
        }),
      ];

    errorCases.forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/templates`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });

  describe('POST /matrices/templates/:templateId { action: addSkill }', () => {
    it('adds an empty skill to the requested skill group', () =>
      Promise.all([Promise.map(skillsFixture, insertSkill), insertTemplate(Object.assign({}, sampleTemplate))])
        .then(() => request(app)
          .post(`${prefix}/templates/eng-nodejs`)
          .send({ action: 'addSkill', level: 'Expert', category: 'Magicness' })
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(() => templates.findOne({ id: 'eng-nodejs' }))
          .then((newTemplate) => {
            expect(newTemplate.skillGroups[5].level).to.equal('Expert');
            expect(newTemplate.skillGroups[5].category).to.equal('Magicness');
            expect(newTemplate.skillGroups[5].skills.length).to.equal(2);
          })));

    it('adds an existing skill to the requested skill group', () => {
      const [{ id: skillOneId }, { id: skillTwoId }] = skillsFixture;
      const groupOneSkillsLens = R.lensPath(['skillGroups', 0, 'skills']);
      const template = R.set(groupOneSkillsLens, [skillOneId], sampleTemplate);

      return Promise.all([Promise.map(skillsFixture, insertSkill), insertTemplate(Object.assign({}, template))])
        .then(() => request(app)
          .post(`${prefix}/templates/eng-nodejs`)
          .send({ action: 'addSkill', level: 'Novice', category: 'Dragon Slaying', existingSkillId: skillTwoId })
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(() => templates.findOne({ id: 'eng-nodejs' }))
          .then((newTemplate) => {
            expect(newTemplate.skillGroups[0].level).to.equal('Novice');
            expect(newTemplate.skillGroups[0].category).to.equal('Dragon Slaying');
            expect(newTemplate.skillGroups[0].skills.length).to.equal(2);
            expect(newTemplate.skillGroups[0].skills).to.eql([skillOneId, skillTwoId]);
          }));
    });

    it('removes an existing skill from its source group and adds it to the specified target', () => {
      const groupOneSkillsLens = R.lensPath(['skillGroups', 0, 'skills']);
      const groupTwoSkillsLens = R.lensPath(['skillGroups', 1, 'skills']);

      const template = R.compose(
        R.set(groupOneSkillsLens, [4, 5]),
        R.set(groupTwoSkillsLens, [6]),
      )(sampleTemplate);

      return Promise.all([Promise.map(skillsFixture, insertSkill), insertTemplate(Object.assign({}, template))])
        .then(() => request(app)
          .post(`${prefix}/templates/eng-nodejs`)
          .send({ action: 'addSkill', level: 'Expert', category: 'Dragon Slaying', existingSkillId: 5 })
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(() => templates.findOne({ id: 'eng-nodejs' }))
          .then((newTemplate) => {
            const groupOneSkills = R.view(groupOneSkillsLens, newTemplate);
            const groupTwoSkills = R.view(groupTwoSkillsLens, newTemplate);

            expect(groupOneSkills).to.eql([4]);
            expect(groupTwoSkills).to.eql([6, 5]);
          }));
    });

    it('does not add a duplicate skill if it already exists in the target skill group', () => {
      const skillsLens = R.lensPath(['skillGroups', 0, 'skills']);
      const template = R.set(skillsLens, [4, 5], sampleTemplate);

      return Promise.all([Promise.map(skillsFixture, insertSkill), insertTemplate(Object.assign({}, template))])
        .then(() => request(app)
          .post(`${prefix}/templates/eng-nodejs`)
          .send({ action: 'addSkill', level: 'Novice', category: 'Dragon Slaying', existingSkillId: 5 })
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(() => templates.findOne({ id: 'eng-nodejs' }))
          .then((newTemplate) => {
            const skills = R.view(skillsLens, newTemplate);
            expect(skills).to.eql([4, 5]);
          }));
    });

    const errorCases =
      [
        () => ({
          desc: 'not authorized',
          token: normalUserToken,
          body: { action: 'addSkill', level: 'Expert', category: 'Magicness' },
          expect: 403,
        }),
        () => ({
          desc: 'missing skill',
          token: adminToken,
          body: { action: 'addSkill', level: 'Expert', category: 'Magicness', existingSkillId: 1011101 },
          expect: 400,
        }),
        () => ({
          desc: 'bad action',
          token: adminToken,
          body: { action: 'foo', level: 'Expert', category: 'Magicness' },
          expect: 400,
        }),
        () => ({
          desc: 'bad level',
          token: adminToken,
          body: { action: 'addSkill', level: 'Foo', category: 'Magicness' },
          expect: 400,
        }),
        () => ({
          desc: 'bad category',
          token: adminToken,
          body: { action: 'addSkill', level: 'Expert', category: 'Foo' },
          expect: 400,
        }),
      ];

    errorCases.forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        insertTemplate(Object.assign({}, sampleTemplate))
          .then(() => request(app)
            .post(`${prefix}/templates/eng-nodejs`)
            .send(test().body)
            .set('Cookie', `${cookieName}=${test().token}`)
            .expect(test().expect))));
  });

  describe('POST /matrices/templates/:templateId { action: replaceSkill }', () => {
    it('replace a skill in an existing skill group with a new skill passed in', () => {
      const updatedSkill = R.clone(skillsFixture[0]);
      updatedSkill.name = 'updated skill';

      return Promise.all([Promise.map(skillsFixture, insertSkill), insertTemplate(Object.assign({}, sampleTemplate))])
        .then(() => request(app)
          .post(`${prefix}/templates/eng-nodejs`)
          .send({ action: 'replaceSkill', level: 'Novice', category: 'Dragon Flight', skill: updatedSkill })
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(() => templates.findOne({ id: 'eng-nodejs' }))
          .then((newTemplate) => {
            const skillGroup = newTemplate.skillGroups[4];
            expect(skillGroup.level).to.equal('Novice');
            expect(skillGroup.category).to.equal('Dragon Flight');
            expect(skillGroup.skills.length).to.equal(1);
            expect(skillGroup.skills[0]).to.not.equal(1);
            return skills.findOne({ id: skillGroup.skills[0] })
              .then((skill) => {
                expect(skill).to.not.be.null;
                expect(skill.name).to.equal(updatedSkill.name);
              });
          }));
    });

    // TODO: no skill validation (shouldn't be an issue right now)
    const errorCases =
      [
        () => ({
          desc: 'not authorized',
          token: normalUserToken,
          body: { action: 'replaceSkill', level: 'Expert', category: 'Magicness', skill: skillsFixture[0] },
          expect: 403,
        }),
        () => ({
          desc: 'bad level',
          token: adminToken,
          body: { action: 'replaceSkill', level: 'Foo', category: 'Magicness', skill: skillsFixture[0] },
          expect: 400,
        }),
        () => ({
          desc: 'bad category',
          token: adminToken,
          body: { action: 'replaceSkill', level: 'Expert', category: 'Foo', skill: skillsFixture[0] },
          expect: 400,
        }),
      ];

    errorCases.forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        insertTemplate(Object.assign({}, sampleTemplate))
          .then(() => request(app)
            .post(`${prefix}/templates/eng-nodejs`)
            .send(test().body)
            .set('Cookie', `${cookieName}=${test().token}`)
            .expect(test().expect))));
  });

  describe('POST /matrices/templates/:templateId { action: removeSkill }', () => {
    it('remove a skill from the template', () =>
      Promise.all([Promise.map(skillsFixture, insertSkill), insertTemplate(Object.assign({}, sampleTemplate))])
        .then(() => request(app)
          .post(`${prefix}/templates/eng-nodejs`)
          .send({ action: 'removeSkill', level: 'Novice', category: 'Dragon Flight', skillId: 1 })
          .set('Cookie', `${cookieName}=${adminToken}`)
          .expect(200)
          .then(() => templates.findOne({ id: 'eng-nodejs' }))
          .then((newTemplate) => {
            const skillGroup = newTemplate.skillGroups[4];
            expect(skillGroup.level).to.equal('Novice');
            expect(skillGroup.category).to.equal('Dragon Flight');
            expect(skillGroup.skills.length).to.equal(0);
          })));

    const errorCases =
      [
        () => ({
          desc: 'not authorized',
          token: normalUserToken,
          body: { action: 'removeSkill', level: 'Expert', category: 'Magicness', skillId: skillsFixture[0].id },
          expect: 403,
        }),
        () => ({
          desc: 'bad level',
          token: adminToken,
          body: { action: 'replaceSkill', level: 'Foo', category: 'Magicness', skillId: skillsFixture[0].id },
          expect: 400,
        }),
        () => ({
          desc: 'bad category',
          token: adminToken,
          body: { action: 'replaceSkill', level: 'Expert', category: 'Foo', skillId: skillsFixture[0].id },
          expect: 400,
        }),
      ];

    errorCases.forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        insertTemplate(Object.assign({}, sampleTemplate))
          .then(() => request(app)
            .post(`${prefix}/templates/eng-nodejs`)
            .send(test().body)
            .set('Cookie', `${cookieName}=${test().token}`)
            .expect(test().expect))));
  });

  describe('GET matrices/skills', () => {
    it('gets all the skills', () =>
      Promise.map(skillsFixture, insertSkill)
        .then(() =>
          request(app)
            .get(`${prefix}/skills`)
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(200)
            .then((res) => {
              // dear future me, I'm sorry.
              expect(res.body[1].name).to.equal(skillsFixture[0].name);
              expect(res.body[2].name).to.equal(skillsFixture[1].name);
              expect(res.body[12].name).to.equal(skillsFixture[11].name);
            })));
  });

  describe('POST matrices/skills', () => {
    it('permits saving of a new skill by admin users', () =>
      request(app)
        .post(`${prefix}/skills`)
        .send({
          action: 'save',
          skills: [sampleSkill],
        })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(201)
        .then(() => skills.findOne({ id: 1 }))
        .then((newSkill) => {
          expect(newSkill.id).to.equal(1);
          expect(newSkill.name).to.equal('Dragon Feeding');
        }));

    it('permits saving of a list of new skills by admin users', () =>
      request(app)
        .post(`${prefix}/skills`)
        .send({
          action: 'save',
          skills: skillsFixture,
        })
        .set('Cookie', `${cookieName}=${adminToken}`)
        .expect(201)
        .then(() => skills.find({}))
        .then(savedSkills => savedSkills.toArray())
        .then((savedSkills) => {
          expect(savedSkills.length).to.equal(skillsFixture.length);
        }));

    it('updates an existing skill with the same id', () =>
      insertSkill(Object.assign({}, sampleSkill))
        .then(() =>
          request(app)
            .post(`${prefix}/skills`)
            .send({
              action: 'save',
              skills: [Object.assign({}, sampleSkill, { name: 'new name', questions: [] })],
            })
            .set('Cookie', `${cookieName}=${adminToken}`)
            .expect(201))
        .then(() => skills.findOne({ id: 1 }))
        .then((updatedSkill) => {
          expect(updatedSkill.id).to.equal(1);
          expect(updatedSkill.name).to.deep.equal('new name');
          expect(updatedSkill.questions.length).to.equal(0);
        }));

    const errorCases =
      [
        () => ({
          desc: 'not authorized',
          token: normalUserToken,
          body: { action: 'create', skill: {} },
          expect: 403,
        }),
        () => ({
          desc: 'bad action',
          token: adminToken,
          body: { action: 'foo', skill: {} },
          expect: 400,
        }),
      ];

    errorCases.forEach(test =>
      it(`should handle error cases '${test().desc}'`, () =>
        request(app)
          .post(`${prefix}/skills`)
          .send(test().body)
          .set('Cookie', `${cookieName}=${test().token}`)
          .expect(test().expect)));
  });
});
