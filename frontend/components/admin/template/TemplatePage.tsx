import * as React from 'react';
import * as R from 'ramda';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Alert, Col } from 'react-bootstrap';

import { actions, MatricesState } from '../../../modules/admin/matrices';
import * as selectors from '../../../modules/admin';

import TemplatePageHeader from './TemplatePageHeader';
import Matrix from '../matrix/Matrix';
import ErrorAlert from '../../common/ErrorAlert';

type TemplatePageComponentProps = MatricesState &
  {
    actions: typeof actions,
    params: {
      templateId: string,
    },
    addSkillToTemplateResult: ServerResult,
    removeSkillResult: ServerResult,
    replaceSkillResult: ServerResult,
    retrieveTemplateResult: ServerResult,
    retrievedTemplate: {
      skills: UnhydratedTemplateSkill[],
      template: NormalizedTemplateViewModel,
    },
  };

class TemplatePageComponent extends React.Component<TemplatePageComponentProps, void> {
  constructor(props) {
    super(props);
    this.onModifySkill = this.onModifySkill.bind(this);
    this.onAddSkill = this.onAddSkill.bind(this);
    this.onReplaceSkill = this.onReplaceSkill.bind(this);
    this.onRemoveSkill = this.onRemoveSkill.bind(this);
  }

  onAddSkill(template, level, category, existingSkillId) {
    this.props.actions.addSkillToTemplate(level, category, template, existingSkillId);
  }

  onModifySkill(skill: UnhydratedTemplateSkill) {
    this.props.actions.saveSkills([skill]);
  }

  onReplaceSkill(template, level: string, category: string, skill: UnhydratedTemplateSkill) {
    this.props.actions.replaceSkill(level, category, template, skill);
  }

  onRemoveSkill(template, level: string, category: string, skill: UnhydratedTemplateSkill) {
    this.props.actions.removeSkill(level, category, template, skill);
  }

  componentWillMount() {
    const { retrievedTemplate, params } = this.props;

    if (!retrievedTemplate || retrievedTemplate.template.id !== params.templateId) {
      this.props.actions.retrieveTemplate(this.props.params.templateId);
    }
  }

  render() {
    const { retrieveTemplateResult, retrievedTemplate, params, addSkillToTemplateResult, removeSkillResult, replaceSkillResult } = this.props;
    const template = retrievedTemplate && retrievedTemplate.template;
    const skills = retrievedTemplate && retrievedTemplate.skills;

    if (retrieveTemplateResult && retrieveTemplateResult.error) {
      return (
        <Col md={12}>
          <ErrorAlert
            messageContext="Unable to retrieve template"
            error={retrieveTemplateResult.error}
          />
        </Col>
      );
    }

    if (!template || template.id !== params.templateId) {
      return false;
    }

    return (
      <div className="evaluation-grid">
        <div className="evaluation-grid__item">
          <TemplatePageHeader templateName={template.name}/>
        </div>
        <Col md={6}>
          <ErrorAlert
            messageContext="Unable to add skill to template"
            error={addSkillToTemplateResult && addSkillToTemplateResult.error}
          />
          <ErrorAlert
            messageContext="Unable to remove skill from template"
            error={removeSkillResult && removeSkillResult.error}
          />
          <ErrorAlert
            messageContext="Unable to update skill and force re-evaluation"
            error={replaceSkillResult && replaceSkillResult.error}
          />
        </Col>
        <div className="evaluation-grid__item">
          <Row>
            <Col md={20}>
              <Matrix
                categories={template.categories}
                levels={template.levels}
                skillGroups={template.skillGroups}
                skills={skills}
                onModifySkill={this.onModifySkill}
                onReplaceSkill={R.curry(this.onReplaceSkill)(template)}
                onRemoveSkill={R.curry(this.onRemoveSkill)(template)}
                onAddSkill={R.curry(this.onAddSkill)(template)}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export const
  TemplatePage = connect(
    state => ({
      retrievedTemplate: selectors.getRetrievedTemplate(state),
      retrieveTemplateResult: selectors.getRetrieveTemplateResult(state),
      addSkillToTemplateResult: selectors.getAddSkillToTemplateResult(state),
      removeSkillResult: selectors.getRemoveSkillResult(state),
      replaceSkillResult: selectors.getReplaceSkillResult(state),
    }),
    dispatch => ({
      actions: bindActionCreators(actions, dispatch),
    }),
  )(TemplatePageComponent);
