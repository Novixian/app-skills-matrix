import { createAction, handleActions } from 'redux-actions';
import { constants as usersConstants } from './users';

const inviteUsersSuccess = createAction(usersConstants.INVITE_USERS_SUCCESS);
const inviteUsersFailure = createAction(usersConstants.INVITE_USERS_FAILURE);

export default handleActions({
  [inviteUsersSuccess]: () => ({ inviteUsers: { success: true } }),
  [inviteUsersFailure]: (state, action) => ({ inviteUsers: { success: false, error: action.payload } }),
}, { results: {} });

export const getInviteUsersResult = state => state.inviteUsers;
