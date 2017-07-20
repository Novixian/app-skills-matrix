// @flow
import type { $Response, $Request, NextFunction } from 'express';
import Promise from 'bluebird';

import type { User } from '../models/users/user';

import createHandler from './createHandler';

import actions from '../models/actions';
import { getUserById } from '../models/users';
import { ONLY_USER_AND_MENTOR_CAN_SEE_ACTIONS } from './errors';

const handlerFunctions = Object.freeze({
  actions: {
    find: (req: $Request, res: $Response, next: NextFunction): Promise<null> => {
      const { evaluationId, type } = req.query;
      const { userId } = req.params;
      const { user }: { user: User } = (res.locals: any);

      if (user.id === userId) {
        return Promise.try(() => actions.find(userId, evaluationId, type))
          .then(a => res.status(200).json(a.map(action => action.viewModel)))
          .catch(next);
      }

      return getUserById(userId)
        .then(({ mentorId }) =>
          (user.id === mentorId
            ? Promise.try(() => actions.find(userId, evaluationId, type))
              .then(a => res.status(200).json(a.map(action => action.viewModel)))
              .catch(next)
            : res.status(403).json(ONLY_USER_AND_MENTOR_CAN_SEE_ACTIONS())));
    },
  },
});

export default createHandler(handlerFunctions);
