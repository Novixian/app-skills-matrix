import * as Promise from 'bluebird';
import * as R from 'ramda';
import * as Joi from 'joi';

import matrices from '../models/matrices/index';
import {
  INVALID_LEVEL_OR_CATEGORY,
  TEMPLATE_NOT_FOUND,
  INVALID_TEMPLATE_UPDATE,
  DUPLICATE_TEMPLATE,
  MISSING_SKILL,
} from './errors';
import { Skill } from '../models/matrices/skill';

const { templates, skills } = matrices;

const templateSaveSchema = Joi.object().keys({
  id: Joi.string().required(),
  name: Joi.string().required(),
  version: Joi.number().required(),
  categories: Joi.array().items(Joi.string().required()).required(),
  levels: Joi.array().items(Joi.string().required()).required(),
  skillGroups: Joi.array().items(Joi.object().keys({
    category: Joi.string().required(),
    level: Joi.string().required(),
    skills: Joi.array().required(),
  })).min(1).required(),
}).required().unknown();

const handlerFunctions = Object.freeze({
  templates: {
    save: (req, res, next) => {
      Promise.try(() => {
        const { error, value: validTemplate } = templateSaveSchema.validate(req.body.template);
        if (error) throw ({ status: 400, data: INVALID_TEMPLATE_UPDATE() });

        return validTemplate;
      })
        .then(validTemplateSubmission => templates.getById(validTemplateSubmission.id)
          .then((retrievedTemplate) => {
            if (retrievedTemplate) {
              throw ({ status: 400, data: DUPLICATE_TEMPLATE() });
            }

            return templates.addTemplate(validTemplateSubmission);
          })
          .then(t => res.status(201).json(t.viewModel())))
        .catch(err => (err.status && err.data) ? res.status(err.status).json(err.data) : next(err));
    },
    retrieve: (req, res, next) => {
      Promise.try(() => templates.getById(req.params.templateId))
        .then((template) => {
          if (!template) {
            return res.status(404).json(TEMPLATE_NOT_FOUND());
          }
          return res.status(200).json(template.normalizedViewModel());
        })
        .catch(next);
    },
    addSkill: (req, res, next) => {
      Promise.try(() => templates.getById(req.params.templateId))
        .then((template) => {
          const existingSkillId = R.path(['body', 'existingSkillId'], req) as string;
          const level = R.path(['body', 'level'], req) as string;
          const category = R.path(['body', 'category'], req) as string;

          if (!template) {
            throw ({ status: 400, data: TEMPLATE_NOT_FOUND() });
          }

          if (!template.hasLevel(level) || !template.hasCategory(category)) {
            throw ({ status: 400, data: INVALID_LEVEL_OR_CATEGORY(level, category, template.id) });
          }

          if (existingSkillId) {
            return skills.getById(existingSkillId)
              .then((existingSkill) => {
                if (!existingSkill) {
                  throw ({ status: 400, data: MISSING_SKILL(existingSkillId) });
                }

                const changes = template.addSkill(level, category, existingSkill.id);
                return templates.updateTemplate(template, changes);
              });
          }

          return skills.addNewSkill()
            .then(({ id }) => {
              const changes = template.addSkill(level, category, id);
              return templates.updateTemplate(template, changes);
            });
        })
        .then(t => skills.getAll()
          .then(skills => res.status(200).json({ template: t.normalizedViewModel(), skills: skills.viewModel() })))
        .catch(err => (err.status && err.data) ? res.status(err.status).json(err.data) : next(err));
    },
    replaceSkill: (req, res, next) => {
      Promise.try(() => templates.getById(req.params.templateId))
        .then((template) => {
          if (!template) {
            return res.status(404).json(TEMPLATE_NOT_FOUND());
          }
          const { level, category } = req.body;
          if (!template.hasLevel(level) || !template.hasCategory(category)) {
            return res.status(400).json(INVALID_LEVEL_OR_CATEGORY(level, category, template.id));
          }
          return skills.addNewSkill(req.body.skill)
            .then((newSkill) => {
              const changes = template.replaceSkill(level, category, req.body.skill.id, newSkill.id);
              return Promise.all([templates.updateTemplate(template, changes), skills.getAll()]);
            }).then(([t, skills]) => res.status(200).json({
              template: t.normalizedViewModel(),
              skills: skills.viewModel(),
            }));
        })
        .catch(next);
    },
    removeSkill: (req, res, next) => {
      Promise.try(() => templates.getById(req.params.templateId))
        .then((template) => {
          if (!template) {
            return res.status(404).json(TEMPLATE_NOT_FOUND());
          }
          const { level, category } = req.body;
          if (!template.hasLevel(level) || !template.hasCategory(category)) {
            return res.status(400).json(INVALID_LEVEL_OR_CATEGORY(level, category, template.id));
          }
          const changes = template.removeSkill(level, category, req.body.skillId);
          return Promise.all([templates.updateTemplate(template, changes), skills.getAll()])
            .then(([t, skills]) => res.status(200).json({
              template: t.normalizedViewModel(),
              skills: skills.viewModel(),
            }));
        })
        .catch(next);
    },
  },
  skills:
    {
      save: (req, res, next) => {
        Promise.map<UnhydratedTemplateSkill, Skill>(req.body.skills,
          skill => skills.getById(skill.id)
            .then(retrievedSkill =>
              (retrievedSkill
                ? skills.updateSkill(retrievedSkill, skill)
                : skills.addSkill(skill))))
          .then(changedSkills => res.status(201).json(R.map(s => s.data(), changedSkills)))
          .catch(next);
      },
      getAll:
        (req, res, next) =>
          Promise.try(() => skills.getAll())
            .then(allSkills => res.status(200).json(allSkills.viewModel()))
            .catch(next),
    }
  ,
});

export default handlerFunctions;
