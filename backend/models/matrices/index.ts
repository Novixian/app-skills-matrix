import * as R from 'ramda';
import * as Promise from 'bluebird';

import database from '../../database';
import template, { newTemplate, Template } from './template';
import skills from './skills';
import skill, { newSkill, Skill } from './skill';

const templatesCollection: any = database.collection('templates');
const skillsCollection: any = database.collection('skills');

skillsCollection.ensureIndex({ id: 1 }, { unique: true, background: true });
templatesCollection.ensureIndex({ id: 1 }, { unique: true, background: true });

export default {
  templates: {
    addTemplate({ id, name, skillGroups, categories, levels, version }): Promise<Template> {
      const aTemplate = newTemplate(id, name, skillGroups, levels, categories, version);
      return templatesCollection.updateOne({ id }, { $set: aTemplate }, { upsert: true })
        .then(() => templatesCollection.findOne({ id }))
        .then(retrievedTemplate => template(retrievedTemplate));
    },
    getById(id): Promise<Template> {
      return templatesCollection.findOne({ id })
        .then(res => (res ? template(res) : null));
    },
    getAll(): Promise<Template[]> {
      return templatesCollection.find()
        .then(results => results.toArray())
        .then(results => results.map(doc => template(doc)));
    },
    updateTemplate(original, updates): Promise<Template> {
      return templatesCollection.updateOne({ id: original.id }, { $set: R.omit(['_.id'], updates) })
        .then(() => templatesCollection.findOne({ id: original.id }))
        .then(updatedTemplate => template(updatedTemplate));
    },
  },
  skills: {
    addSkill({ id, name, type, version, criteria, questions }): Promise<Skill> {
      const aSkill = newSkill(id, name, type, version, criteria, questions);
      return skillsCollection.updateOne({ id }, { $set: aSkill }, { upsert: true })
        .then(() => skillsCollection.findOne({ id }))
        .then(retrievedSkill => skill(retrievedSkill));
    },
    getById(id): Promise<Skill> {
      return skillsCollection.findOne({ id })
        .then(res => (res ? skill(res) : null));
    },
    addNewSkill(values = { name: '** New skill **', type: 'skill', criteria: '', questions: [] }): Promise<Skill> {
      // poor man's autoincrement is susceptible to race conditions
      return skillsCollection.findOne({}, { sort: [['id', 'descending']] })
        .then(((res) => {
          const newId = res.id + 1;
          const aSkill = newSkill(newId, values.name, values.type, 1, values.criteria, values.questions);
          return skillsCollection.insertOne(aSkill)
            .then(() => skillsCollection.findOne({ id: newId }))
            .then(retrievedSkill => skill(retrievedSkill));
        }));
    },
    updateSkill(original, updates): Promise<Skill> {
      return skillsCollection.updateOne({ id: original.id }, { $set: R.omit(['_.id'], updates) })
        .then(() => skillsCollection.findOne({ id: original.id }))
        .then(updatedSkill => skill(updatedSkill));
    },
    getAll() {
      return skillsCollection.find()
        .then(results => results.toArray())
        .then(results => skills(results));
    },
  },
};
