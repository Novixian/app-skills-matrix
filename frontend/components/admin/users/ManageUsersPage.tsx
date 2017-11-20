import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Alert, Button, Grid, Row } from 'react-bootstrap';
import * as R from 'ramda';

import { actions } from '../../../modules/admin/users';
import UserList from './UserList';
import InviteUsers from './InviteUsers';
import * as selectors from '../../../modules/admin';

type ManageUsersPageComponentProps = {
  actions: typeof actions,
  success: boolean,
  error?: { message?: string },
  users: { users: UserDetailsViewModel[], newEvaluations: (EvaluationMetadataViewModel & { success: boolean, message: string })[] },
  matrices: { templates: TemplateViewModel[] },
  inviteUsersResult: ServerResult,
};

type ManageUsersPageComponentState = {
  selectedUsers: string[],
};

class ManageUsersPageComponent extends React.Component<ManageUsersPageComponentProps, ManageUsersPageComponentState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: [],
    };

    this.onSelectMentor = this.onSelectMentor.bind(this);
    this.onSelectTemplate = this.onSelectTemplate.bind(this);
    this.onSelectLineManager = this.onSelectLineManager.bind(this);
    this.onUserSelectionChange = this.onUserSelectionChange.bind(this);
    this.onStartEvaluation = this.onStartEvaluation.bind(this);
    this.onInviteUsers = this.onInviteUsers.bind(this);
  }

  onStartEvaluation(e) {
    e.preventDefault();
    this.state.selectedUsers.map(this.props.actions.startEvaluation);
    this.setState({ selectedUsers: [] });
  }

  onUserSelectionChange(e: any, user: UserDetailsViewModel) {
    const checked = e.target.checked;
    let selectedUsers;
    if (checked) {
      selectedUsers = this.state.selectedUsers.concat([user.id]);
    } else {
      selectedUsers = R.filter(id => id !== user.id, this.state.selectedUsers);
    }

    return this.setState({ selectedUsers });
  }

  onSelectMentor(e, user) {
    e.preventDefault();
    this.props.actions.selectMentor(e.target.value, user);
  }

  onSelectLineManager(e, user) {
    e.preventDefault();
    this.props.actions.selectLineManager(e.target.value, user);
  }

  onSelectTemplate(e, user) {
    e.preventDefault();
    this.props.actions.selectTemplate(e.target.value, user);
  }

  onInviteUsers({ users }) {
    this.props.actions.inviteUsers(users);
  }

  render() {
    const { error } = this.props;

    return (
      <Grid>
        <Row>
          <InviteUsers
            onInviteUsers={this.onInviteUsers}
            inviteUsersResult={this.props.inviteUsersResult}
          />
        </Row>
        <Row>
          {error ? <Alert bsStyle="danger">Something went wrong: {error.message || 'unknown issue'}</Alert> : false}
          <UserList
            selectedUsers={this.state.selectedUsers}
            users={this.props.users.users}
            templates={this.props.matrices.templates}
            onSelectMentor={this.onSelectMentor}
            onSelectTemplate={this.onSelectTemplate}
            onSelectLineManager={this.onSelectLineManager}
            onUserSelectionChange={this.onUserSelectionChange}
          />
        </Row>
        <Row>
          <Button
            bsStyle="primary"
            disabled={this.state.selectedUsers.length === 0}
            onClick={this.onStartEvaluation}
          >
            Start evaluation
          </Button>
        </Row>
        <Row>
          <ul>
            {
              this.props.users.newEvaluations.map(e => (
                <li key={e.id}>
                  {
                    e.success
                      ? <div>New evaluation created for {e.subject.name}</div>
                      : e.message
                  }
                </li>
              ))
            }
          </ul>
        </Row>
      </Grid>
    );
  }
}

export const ManageUsersPage = connect(
  state => ({
    users: state.users,
    matrices: state.matrices,
    error: selectors.getUserManagementError(state),
    inviteUsersResult: selectors.getInviteUsersResult(state),
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch),
  }),
)(ManageUsersPageComponent);
