import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Form, FormGroup, FormControl, ControlLabel, Radio, Glyphicon, Alert } from 'react-bootstrap';
import { actions } from '../../../modules/admin/manageMatrices';
import SaveEntityForm from './SaveEntityForm';

class SaveSkillComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { skill: '' };

    this.updateSkillState = this.updateSkillState.bind(this);
    this.saveSkill = this.saveSkill.bind(this);
  }

  updateSkillState(e) {
    return this.setState({ skill: e.target.value });
  }

  saveSkill(e) {
    e.preventDefault();
    this.props.actions.saveSkill(this.state.skill)
  }

  render() {
    return (
      <div>
        <Row>
          <h2 className="header">New skill</h2>
        </Row>
        <SaveEntityForm
          entityName="skill"
          entity={this.state.skill}
          saveEntity={this.saveSkill}
          updateEntityInLocalState={this.updateSkillState}
          success={this.props.success}
          error={this.props.error}
        />
      </div>
    );
  }
}

export const SaveSkill = connect(
  function mapStateToProps(state) {
    return state.manageMatrices.skill;
  },
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(actions, dispatch)
    };
  }
)(SaveSkillComponent);
