import * as React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import UserApp from './components/user/App';
import AdminApp from './components/admin/App';
import { DashboardPage as UserDashboard } from './components/user/dashboard/Dashboard';
import { ManageUsersPage } from './components/admin/users/ManageUsersPage';
import { ManageTemplatesPage } from './components/admin/matrices/ManageTemplatesPage';
import { TemplatePage } from './components/admin/template/TemplatePage';
import { EvaluationPage } from './components/user/evaluations/EvaluationPage';
import { ActionPage } from './components/user/actions/ActionPage';

export const adminRoutes = (
  <Router history={browserHistory}>
    <Route path="/admin" component={AdminApp}>
      <IndexRoute component={ManageUsersPage} />
      <Route path="/admin/users" component={ManageUsersPage} />
      <Route path="/admin/templates" component={ManageTemplatesPage} />
      <Route path="/admin/templates/:templateId" component={TemplatePage} />
    </Route>
  </Router>
);

export const userRoutes = (
  <Router history={browserHistory}>
    <Route path="/" component={UserApp}>
      <IndexRoute component={UserDashboard} />
      <Route path="dashboard" component={UserDashboard} />
      <Route path="evaluations/:evaluationId" component={EvaluationPage} />
      <Route path="evaluations/:evaluationId/:actionType" component={ActionPage} />
    </Route>
  </Router>
);
