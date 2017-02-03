import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions';
import AddUserForm from './AddUserForm';
import UserList from './UserList';

class ManageUsersPageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };

    this.updateUserState = this.updateUserState.bind(this);
    this.onSave = this.onSave.bind(this);
    this.clearUserForm = this.clearUserForm.bind(this);
  }

  updateUserState(e) {
    const field = e.target.name;
    let user = this.state.user;
    user[field] = e.target.value;
    return this.setState({ user });
  }

  clearUserForm() {
    this.setState({ user: {} });
  }

  onSave(e) {
    e.preventDefault();
    this.props.actions.saveUser(this.state.user)
      .then(() => this.clearUserForm())
  };

  render() {
    return (
      <div>
        <AddUserForm
          user={this.state.user}
          updateUserState={this.updateUserState}
          onSave={this.onSave}
        />
        <UserList
          users={this.props.users}
        />
      </div>
    );
  }
}

ManageUsersPageComponent.propTypes = {
  users: PropTypes.array
};

export const ManageUsersPage = connect(
  function mapStateToProps(state) {
    return {
      users: state,
    }
  },
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(Actions, dispatch)
    };
  }
)(ManageUsersPageComponent);