import { combineReducers } from 'redux';

import users, * as fromUsers from './users';
import user, * as fromUser from './user';
import matrices, * as fromMatrices from './matrices';
import evaluations, * as fromEvaluations from './evaluations';
import results, * as fromResults from './results';

export default combineReducers({ user, users, matrices, evaluations, results });

/* USERS SELECTORS */

export const getUserManagementError = ({ users }) =>
  fromUsers.getUserManagementError(users);

export const getUser = ({ users }, userId: string) =>
  fromUsers.getUser(users, userId);

export const getSortedUsers = ({ users }) =>
  fromUsers.getSortedUsers(users);

export const getInviteUsersResult = ({ results }) =>
  fromResults.getInviteUsersResult(results);

/* USER SELECTORS */

export const getLoggedInUsername = ({ user }) =>
  fromUser.getLoggedInUsername(user);

/* EVALUATIONS SELECTORS */

export const getSortedEvaluationsByUserId = ({ evaluations }, userId: string) =>
  fromEvaluations.getSortedEvaluationsByUserId(evaluations, userId);

export const getEvaluationStatus = ({ evaluations }, evaluationId: string) =>
  fromEvaluations.getEvaluationStatus(evaluations,  evaluationId);

export const getStatusUpdateError = ({ evaluations }) =>
  fromEvaluations.getStatusUpdateError(evaluations);

/* MATRICES SELECTORS */

export const getRetrievedTemplate = ({ matrices }) =>
  fromMatrices.getRetrievedTemplate(matrices);

/* RESULTS SELECTORS */

export const getAddTemplateResult = ({ results }) =>
  fromResults.getAddTemplateResult(results);

export const getSaveSkillsResult = ({ results }) =>
  fromResults.getSaveSkillsResult(results);

export const getAddSkillToTemplateResult = ({ results }) =>
  fromResults.getAddSkillToTemplateResult(results);

export const getRemoveSkillResult = ({ results }) =>
  fromResults.getRemoveSkillResult(results);

export const getReplaceSkillResult = ({ results }) =>
  fromResults.getReplaceSkillResult(results);

export const getRetrieveTemplateResult = ({ results }) =>
  fromResults.getRetrieveTemplateResult(results);
