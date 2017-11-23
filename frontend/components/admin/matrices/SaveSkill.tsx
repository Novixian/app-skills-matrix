import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from '../../../modules/admin/matrices';
import SaveEntityForm from './SaveEntityForm';
import * as selectors from '../../../modules/admin';

type SaveSkillComponentProps = {
  actions: typeof actions,
  saveSkillResult: ServerResult,
};

class SaveSkillComponent extends React.Component<SaveSkillComponentProps, { skill: string }> {
  constructor(props) {
    super(props);
    this.state = { skill: '' };

    this.updateSkillState = this.updateSkillState.bind(this);
    this.saveSkills = this.saveSkills.bind(this);
  }

  updateSkillState(e) {
    return this.setState({ skill: e.target.value });
  }

  saveSkills(e) {
    e.preventDefault();
    this.props.actions.saveSkillsFromJSON(this.state.skill);
  }

  render() {
    const { saveSkillResult } = this.props;
    const saveSkillSuccess = saveSkillResult && saveSkillResult.success;
    const saveSkillError = saveSkillResult && saveSkillResult.error;

    return (
      <div>
        <SaveEntityForm
          entityName="skill"
          entity={this.state.skill}
          saveEntity={this.saveSkills}
          updateEntityInLocalState={this.updateSkillState}
          success={saveSkillSuccess}
          error={saveSkillError}
        />
      </div>
    );
  }
}

export const SaveSkill = connect(
  state => ({
    saveSkillResult: selectors.getSaveSkillsResult(state),
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch),
  }),
)
(SaveSkillComponent);
