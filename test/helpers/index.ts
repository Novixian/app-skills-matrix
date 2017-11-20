import { ObjectID } from 'mongodb';
import * as R from 'ramda';

import usersData from '../fixtures/users';
import database from '../../backend/database';
import { encrypt as encryptSkills, decrypt as decryptSkills } from '../../backend/models/evaluations/encryption';
import { decrypt as decryptNote, encrypt as encryptNote } from '../../backend/models/notes/encryption';

const users: any = database.collection('users');
const templates: any = database.collection('templates');
const skills: any = database.collection('skills');
const evaluations: any = database.collection('evaluations');
const actions: any = database.collection('actions');
const notes: any = database.collection('notes');
const invitations: any = database.collection('invitations');

const prepopulateUsers = () => users.remove({}).then(() => users.insertMany(R.values(usersData)));
const addNoteIdsToSkill = (noteIds, skillId, oldEval) => {
  const skillIndex = R.findIndex(R.propEq('id', skillId), oldEval.skills);
  const skillNotesLens = R.lensPath(['skills', skillIndex, 'notes']);
  return R.set(skillNotesLens, noteIds, oldEval);
};
const insertEvaluation = (evaluation, userId, name?: string, email?: string) => {
  const document = { ...R.clone(evaluation), user: { id: String(userId), name, email } };
  return evaluations.insertOne(encryptSkills(document));
};

export default {
  prepopulateUsers,
  users,
  invitations,
  assignMentor: (userId, mentorId) => users.update({ _id: new ObjectID(userId) }, { $set: { mentorId: String(mentorId) } }),
  assignLineManager: (userId, lineManagerId) => users.update({ _id: new ObjectID(userId) }, { $set: { lineManagerId: String(lineManagerId) } }),
  templates,
  insertTemplate: template => templates.insertOne(Object.assign({}, template)),
  assignTemplate: (userId, templateId) => users.update({ _id: new ObjectID(userId) }, { $set: { templateId: String(templateId) } }),
  skills,
  insertSkill: skill => skills.insertOne(Object.assign({}, skill)),
  evaluations,
  insertEvaluation,
  getEvaluation: evaluationId => evaluations.findOne({ _id: new ObjectID(evaluationId) }).then(decryptSkills),
  getEvaluations: () => evaluations.find({}).then(e => e.toArray()).then(R.map(decryptSkills)),
  getEvaluationsByUser: (userId: string) => evaluations.find({ 'user.id': userId }).then(e => e.toArray()).then(R.map(decryptSkills)),
  getAllActions: () => actions.find({}).then(e => e.toArray()),
  insertAction: userId => action => actions.insertOne(Object.assign({}, action, { user: { id: String(userId) } })),
  clearDb: () => Promise.all([users.remove({}), templates.remove({}), skills.remove({}), evaluations.remove({}), actions.remove({}), notes.remove({}), invitations.remove({})]),
  skillStatus: (skillList: { id: string }[], skillId) => R.prop('status', R.find(skill => skill.id === skillId, skillList)),
  getSkillNotes: (skillList: {id: string}[], skillId) => R.prop('notes', R.find(skill => skill.id === skillId, skillList)),
  getNotes: (userId, skillId) => notes.find({ userId, skillId }).then(e => e.toArray()).then(R.map(decryptNote)),
  getNoteById: id => notes.findOne({ _id: new ObjectID(id) }),
  insertNote: note => notes.insertOne(encryptNote(note)),
  addNoteIdsToSkill,
};
