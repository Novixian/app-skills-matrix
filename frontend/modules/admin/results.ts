import { handleActions, createAction } from 'redux-actions';
import * as R from 'ramda';

import {
  addTemplateSuccess,
  addTemplateFailure,
  saveSkillsSuccess,
  saveSkillsFailure,
  addSkillSuccess,
  addSkillFailure,
  removeSkillSuccess,
  removeSkillFailure,
  replaceSkillSuccess,
  replaceSkillFailure,
  retrieveTemplateSuccess,
  retrieveTemplateFailure,
} from './matrices';

import {
  inviteUsersFailure,
  inviteUsersSuccess,
  startEvaluationFailure,
  startEvaluationSuccess,
  userUpdateFailure,
  userUpdateSuccess,
} from './users';

const successHandler = api => () => ({ [api]: { success: true } });
const failureHandler = api => (state, action) => ({ [api]: { success: false, error: action.payload } });

export default handleActions({
  [addTemplateSuccess]: successHandler('addTemplate'),
  [addTemplateFailure]: failureHandler('addTemplate'),
  [saveSkillsSuccess]: successHandler('saveSkills'),
  [saveSkillsFailure]: failureHandler('saveSkills'),
  [addSkillSuccess]: successHandler('addSkillToTemplate'),
  [addSkillFailure]: failureHandler('addSkillToTemplate'),
  [removeSkillSuccess]: successHandler('removeSkill'),
  [removeSkillFailure]: failureHandler('removeSkill'),
  [replaceSkillSuccess]: successHandler('replaceSkill'),
  [replaceSkillFailure]: failureHandler('replaceSkill'),
  [retrieveTemplateSuccess]: successHandler('retrieveTemplate'),
  [retrieveTemplateFailure]: failureHandler('retrieveTemplate'),
  [inviteUsersSuccess]: successHandler('inviteUsers'),
  [inviteUsersFailure]: failureHandler('inviteUsers'),
  [userUpdateSuccess]: successHandler('userUpdate'),
  [userUpdateFailure]: failureHandler('userUpdate'),
  [startEvaluationSuccess]: successHandler('startEvaluation'),
  [startEvaluationFailure]: failureHandler('startEvaluation'),
}, {});

export const getAddTemplateResult = state => state.addTemplate;
export const getSaveSkillsResult = state => state.saveSkills;
export const getAddSkillToTemplateResult = state => state.addSkillToTemplate;
export const getRemoveSkillResult = state => state.removeSkill;
export const getReplaceSkillResult = state => state.replaceSkill;
export const getRetrieveTemplateResult = state => state.retrieveTemplate;
export const getInviteUsersResult = state => state.inviteUsers;

