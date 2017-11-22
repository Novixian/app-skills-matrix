import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions } from '../../../modules/admin/matrices';
import * as selectors from '../../../modules/admin';
import SaveEntityForm from './SaveEntityForm';

type SaveTemplateComponentProps = {
  actions: typeof actions,
  addTemplateResult: ServerResult,
};

class SaveTemplateComponent extends React.Component<SaveTemplateComponentProps, any> {
  constructor(props) {
    super(props);
    this.state = { template: '' };

    this.updateTemplateState = this.updateTemplateState.bind(this);
    this.saveTemplate = this.saveTemplate.bind(this);
  }

  updateTemplateState(e) {
    return this.setState({ template: e.target.value });
  }

  saveTemplate(e) {
    e.preventDefault();
    this.props.actions.addTemplateFromJSON(this.state.template);
  }

  render() {
    const { addTemplateResult } = this.props;
    const saveTemplateSuccess = addTemplateResult && addTemplateResult.success;
    const saveTemplateError = addTemplateResult && addTemplateResult.error;

    return (
      <div>
        <SaveEntityForm
          entityName="template"
          entity={this.state.template}
          saveEntity={this.saveTemplate}
          updateEntityInLocalState={this.updateTemplateState}
          success={saveTemplateSuccess}
          error={saveTemplateError}
        />
      </div>
    );
  }
}

export const SaveTemplate = connect(
  state => ({
    addTemplateResult: selectors.getAddTemplateResult(state),
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch),
  }),
)(SaveTemplateComponent);
