import * as React from 'react';
import { connect } from 'react-redux';

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
    return (<div>User's successfully invited.</div>);
  }

  return (
    <div>There has been an error attempting to invite users: `${inviteUsersResult.error ? inviteUsersResult.error.message : 'Unknown Error'}`</div>);
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
        <p>
          <label htmlFor="inviteField">Invite teammates by email</label>
        </p>
        <textarea id="inviteField" value={this.state.users} onChange={this.onUpdateUsers} />
        <div>Enter email addresses separated by whitespace, ',', or ';' characters.</div>
        <button onClick={() => onInviteUsers(this.state)}>Invite</button>
        {inviteUsersResult ? resultMessage(inviteUsersResult) : false};
      </div>);
  }
}

export default InviteUsers;
