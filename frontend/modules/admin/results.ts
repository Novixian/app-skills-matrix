import { createAction, handleActions } from 'redux-actions';

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
  [inviteUsersSuccess]: successHandler('inviteUsers'),
  [inviteUsersFailure]: failureHandler('inviteUsers'),
  [userUpdateSuccess]: successHandler('userUpdate'),
  [userUpdateFailure]: failureHandler('userUpdate'),
  [startEvaluationSuccess]: successHandler('startEvaluation'),
  [startEvaluationFailure]: failureHandler('startEvaluation'),
}, { results: {} });

export const getInviteUsersResult = state => state.inviteUsers;
