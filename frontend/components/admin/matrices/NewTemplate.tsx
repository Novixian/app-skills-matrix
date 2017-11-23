import * as React from 'react';
import * as R from 'ramda';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, ControlLabel, Form, FormControl, FormGroup, Alert } from 'react-bootstrap';

import { actions } from '../../../modules/admin/matrices';
import * as selectors from '../../../modules/admin';
import ErrorAlert from '../../common/ErrorAlert';

import EditableList from './EditableList';

type NewTemplateComponentProps = {
  actions: typeof actions,
  addTemplateResult: ServerResult,
};

const FieldGroup = ({ id, label = '', ...props }) => (
  <FormGroup>
    {label && <ControlLabel>{label}</ControlLabel>}
    <FormControl name={id} {...props} />
  </FormGroup>
);

const initialState = {
  template: {
    name: '',
    version: 1,
    categories: [],
    levels: [],
    skillGroups: [],
  },
};

class NewTemplateComponent extends React.Component<NewTemplateComponentProps, { template: NewTemplate }> {
  constructor(props) {
    super(props);
    this.state = R.clone(initialState);
    this.updateTemplateState = this.updateTemplateState.bind(this);
    this.onAddTemplate = this.onAddTemplate.bind(this);
  }

  updateTemplateState(e) {
    const field = e.target.name;
    const template = this.state.template;
    template[field] = e.target.value;
    return this.setState({ template });
  }

  onAddTemplate(e) {
    e.preventDefault();
    const skillGroups: UnhydratedSkillGroup[] = [];
    const template = this.state.template;
    R.forEach((category) => {
      R.forEach((level) => {
        skillGroups.push({
          category,
          level,
          skills: [],
        });
      }, template.levels);
    }, template.categories);
    template.skillGroups = skillGroups;

    this.setState(R.clone(initialState));
    this.props.actions.addTemplate(template);
  }

  render() {
    const { addTemplateResult } = this.props;
    const addTemplateSuccess = addTemplateResult && addTemplateResult.success;
    const addTemplateError = addTemplateResult && addTemplateResult.error;

    const { template } = this.state;

    return (
      <div>
        <Form onSubmit={this.onAddTemplate}>
          <FieldGroup
            id="name"
            type="text"
            label="Template name"
            value={template.name || ''}
            onChange={this.updateTemplateState}
          />
          <EditableList
            title="Categories"
            addBtnName="Add category"
            placeholder="Category name"
            array={template.categories || []}
            onUpdate={categories => this.updateTemplateState({ target: { name: 'categories', value: categories } })}
          />
          <EditableList
            title="Levels"
            addBtnName="Add Level"
            infoText="Levels should be provided in descending order, from highest to lowest."
            placeholder="Level name"
            array={template.levels || []}
            onUpdate={levels => this.updateTemplateState({ target: { name: 'levels', value: levels } })}
          />
          <Button bsStyle="primary" type="submit">Create Template</Button>
          {addTemplateSuccess ? <Alert bsStyle="success">Template successfully created</Alert> : null}
          <ErrorAlert messageContext="Unable to create new template" error={addTemplateError} />
        </Form>
      </div>
    );
  }
}

export const NewTemplate = connect(
  state => ({
    addTemplateResult: selectors.getAddTemplateResult(state),
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch),
  }),
)(NewTemplateComponent);
