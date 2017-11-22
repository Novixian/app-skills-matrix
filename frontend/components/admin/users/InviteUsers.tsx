import * as React from 'react';
import { connect } from 'react-redux';
import { Button, FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap';

type InviteUserProps = {
  onInviteUsers: (state: InviteUsersState) => void,
  inviteUsersResult: ServerResult,
};

type InviteUsersState = {
  users: string,
  type: string,
};

const resultMessage = (inviteUsersResult) => {
  if (inviteUsersResult.success) {
    return (<Alert bsStyle="success">User(s) successfully invited.</Alert>);
  }

  return (
    <Alert bsStyle="danger">There has been an error attempting to invite user(s): {inviteUsersResult.error ? inviteUsersResult.error.message : 'Unknown Error'}</Alert>);
};

const defaultState = {
  users: '',
  type: 'standard',
};

class InviteUsers extends React.Component<InviteUserProps, InviteUsersState> {
  constructor(props) {
    super(props);
    this.state = defaultState;

    this.onUpdateUsers = this.onUpdateUsers.bind(this);
  }

  componentWillReceiveProps(nextProps: InviteUserProps) {
    if (nextProps.inviteUsersResult && nextProps.inviteUsersResult.success) {
      this.setState(defaultState);
    }
  }

  onUpdateUsers(e) {
    this.setState({ users: e.target.value });
  }

  render() {
    const { onInviteUsers, inviteUsersResult } = this.props;

    return (
      <div>
        <FormGroup controlId="formControlsTextarea">
          <ControlLabel>Invite teammates by email</ControlLabel>
          <FormControl componentClass="textarea" placeholder="Enter email addresses separated by whitespace, ',', or ';' characters." value={this.state.users} onChange={this.onUpdateUsers} />
        </FormGroup>
        <Button onClick={() => onInviteUsers(this.state)}>Invite</Button>
        {inviteUsersResult ? resultMessage(inviteUsersResult) : false}
      </div>);
  }
}

export default InviteUsers;
