import * as Promise from 'bluebird';
import * as validate from 'express-validation';
import * as Joi from 'joi';

import users from '../models/users/index';
import matrices from '../models/matrices/index';
import { newEvaluation, Evaluation } from '../models/evaluations/evaluation';
import evaluations from '../models/evaluations/index';
import createHandler from './createHandler';
import sendMail from '../services/email/index';
import {
  USER_EXISTS,
  TEMPLATE_NOT_FOUND,
  USER_HAS_NO_TEMPLATE,
  USER_HAS_NO_MENTOR,
  INVALID_USER_UPDATE_REQUESTED,
} from './errors';

const { templates, skills } = matrices;

const updateUserDetailsForAllEvals = (userId, name, email) =>
  evaluations.getByUserId(userId)
    .then(requestedEvaluations =>
      Promise.map(requestedEvaluations, (evaluation: Evaluation) => {
        const changes = evaluation.updateUserDetails(name, email);
        return evaluations.updateEvaluation(changes);
      }));

const handlerFunctions = Object.freeze({
  users: {
    create: (req, res, next) => {
      Promise.try(() => users.getUserByUsername(req.body.username))
        .then((user) => {
          if (user) {
            return res.status(409).json(USER_EXISTS(req.body.username));
          }
          return users.addUser(req.body)
            .then(u => res.status(201).send(u.manageUserViewModel()));
        })
        .catch(next);
    },
  },
  user: {
    selectMentor: {
      handle: (req, res, next) => {
        const { requestedUser } = res.locals;
        const changes = requestedUser.setMentor(req.body.mentorId);

        if (changes.error) {
          return res.status(400).json(changes);
        }
        return users.updateUser(requestedUser, changes)
          .then(updatedUser => res.status(200).json(updatedUser.manageUserViewModel()))
          .catch(next);
      },
    },
    selectLineManager: {
      handle: (req, res, next) => {
        const { requestedUser } = res.locals;
        const changes = requestedUser.setLineManager(req.body.lineManagerId);

        if (changes.error) {
          return res.status(400).json(changes);
        }
        return users.updateUser(requestedUser, changes)
          .then(updatedUser => res.status(200).json(updatedUser.manageUserViewModel()))
          .catch(next);
      },
    },
    selectTemplate: {
      handle: (req, res, next) => {
        const { requestedUser } = res.locals;

        Promise.try(() => templates.getById(req.body.templateId))
          .then((template) => {
            if (!template) {
              return res.status(400).json(TEMPLATE_NOT_FOUND());
            }

            const changes = requestedUser.setTemplate(req.body.templateId);
            return users.updateUser(requestedUser, changes)
              .then(updatedUser => res.status(200).json(updatedUser.manageUserViewModel()));
          })
          .catch(next);
      },
    },
    updateUserDetails: {
      handle: (req, res, next) => {
        const { requestedUser } = res.locals;
        const updateScehma = Joi.object().keys({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required().unknown();

        const { error, value: validUpdate } = updateScehma.validate(req.body);

        if (error) {
          return res.status(400).json(INVALID_USER_UPDATE_REQUESTED());
        }

        const { name, email } = validUpdate;

        return Promise.all([
          users.updateUser(requestedUser, requestedUser.updateUserDetails(name, email)),
          updateUserDetailsForAllEvals(requestedUser.id, name, email),
        ])
          .then(([updatedUser]) => res.status(200).json(updatedUser.userDetailsViewModel()))
          .catch(next);
      },
    },
  },
  evaluations: {
    create: (req, res, next) => {
      const { requestedUser } = res.locals;

      if (!requestedUser.hasTemplate) {
        return res.status(400).json(USER_HAS_NO_TEMPLATE(requestedUser.manageUserViewModel().name));
      }
      if (!requestedUser.hasMentor) {
        return res.status(400).json(USER_HAS_NO_MENTOR(requestedUser.manageUserViewModel().name));
      }
      if (!requestedUser.hasLineManager) {
        return res.status(400).json(USER_HAS_NO_MENTOR(requestedUser.manageUserViewModel().name));
      }

      return Promise.all([templates.getById(requestedUser.templateId), skills.getAll(), evaluations.getLatestByUserId(requestedUser.id)])
        .then(([template, allSkills, latestEvaluation]) => {
          const userEvaluation = newEvaluation(template, requestedUser, allSkills);
          const mergedEvaluation = userEvaluation.mergePreviousEvaluation(latestEvaluation);
          return evaluations.addEvaluation(mergedEvaluation);
        })
        .then((newEval: Evaluation) => {
          sendMail(newEval.newEvaluationEmail())
            .catch(console.error);
          res.status(201).json(newEval.adminEvaluationViewModel());
        })
        .catch(next);
    },
  },
});

export default createHandler(handlerFunctions);
