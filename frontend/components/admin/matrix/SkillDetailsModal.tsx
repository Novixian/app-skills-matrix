import * as React from 'react';
import {
  Modal,
  Button,
  FormGroup,
  FormControl,
  Glyphicon,
  ControlLabel,
  ButtonToolbar,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';

import Questions from './Questions';

type SkillDetailsModalProps = {
  showModal: boolean,
  onClose: () => void,
  skill?: UnhydratedTemplateSkill,
  level?: string,
  category?: string,
  onModifySkill: (skill: UnhydratedTemplateSkill) => void,
  onReplaceSkill: (level: string, category: string, skill: UnhydratedTemplateSkill) => void,
  onRemoveSkill: (level: string, category: string, skill: UnhydratedTemplateSkill) => void,
};

const FieldGroup = ({ id, label = '', ...props }) => (
  <FormGroup>
    {label && <ControlLabel>{label}</ControlLabel>}
    <FormControl name={id} {...props} />
  </FormGroup>
);

const SkillTypeTooltip = () => (
  <OverlayTrigger
    trigger={['hover', 'focus']}
    placement="right"
    overlay={
      <Popover id="skill_type">
        Users are asked to re-evaluate behaviours for every evaluation they undertake.
        This is different to skills, which never require re-evaluation once attained.
      </Popover>
    }
  >
    <Glyphicon glyph="info-sign"/>
  </OverlayTrigger>
);

class SkillDetailsModal extends React.Component<SkillDetailsModalProps, { skill: UnhydratedTemplateSkill, level: string, category: string }> {
  constructor(props) {
    super(props);
    this.state = { skill: this.props.skill, level: this.props.level, category: this.props.category };
    this.updateSkillState = this.updateSkillState.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.updateQuestion = this.updateQuestion.bind(this);
    this.removeQuestion = this.removeQuestion.bind(this);
    this.closeModel = this.closeModel.bind(this);
    this.updateSkill = this.updateSkill.bind(this);
    this.replaceSkill = this.replaceSkill.bind(this);
    this.removeSkill = this.removeSkill.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ skill: nextProps.skill, level: nextProps.level, category: nextProps.category });
  }

  addQuestion() {
    const skill = this.state.skill;
    skill.questions.push({ title: '' });
    return this.setState({ skill });
  }

  updateQuestion(newValue, index) {
    const skill = this.state.skill;
    skill.questions[index] = { title: newValue };
    return this.setState({ skill });
  }

  removeQuestion(index) {
    const skill = this.state.skill;
    skill.questions.splice(index, 1);
    return this.setState({ skill });
  }

  updateSkillState(e) {
    const field = e.target.name;
    const skill = this.state.skill;
    skill[field] = e.target.value;
    return this.setState({ skill });
  }

  closeModel() {
    this.setState({ skill: null });
    this.props.onClose();
  }

  updateSkill() {
    this.props.onModifySkill(this.state.skill);
    this.closeModel();
  }

  replaceSkill() {
    this.props.onReplaceSkill(this.props.level, this.props.category, this.state.skill);
    this.closeModel();
  }

  removeSkill() {
    this.props.onRemoveSkill(this.props.level, this.props.category, this.state.skill);
    this.closeModel();
  }

  render() {
    const { showModal } = this.props;
    const { skill } = this.state;

    if (!skill) {
      return false;
    }

    return (
      <div>
        <Modal show={showModal} onHide={this.closeModel}>
          <Modal.Header closeButton>
            <Modal.Title>Skill ID: {skill.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <FieldGroup
                id="name"
                type="text"
                label="Name"
                value={skill.name || ''}
                onChange={this.updateSkillState}
                placeholder="Name"
              />
              <FieldGroup
                id="criteria"
                type="text"
                label="Criteria"
                value={skill.criteria || ''}
                onChange={this.updateSkillState}
              />
              <FormGroup>
                <ControlLabel>Type <SkillTypeTooltip/></ControlLabel>
                <FormControl
                  componentClass="select"
                  name="type"
                  onChange={this.updateSkillState}
                  defaultValue={skill.type}
                >
                  <option value="select" disabled>select</option>
                  <option value="behaviour">behaviour</option>
                  <option value="skill">skill</option>
                </FormControl>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Questions</ControlLabel>
                {
                  skill.questions
                    ? <Questions questions={skill.questions} update={this.updateQuestion} remove={this.removeQuestion}/>
                    : false
                }
                <Button onClick={this.addQuestion} block><Glyphicon glyph="plus"/>{' '}Add question</Button>
              </FormGroup>
              <ButtonToolbar>
                <Button bsStyle="primary" onClick={this.updateSkill}>
                  Update</Button>
                <Button bsStyle="primary" onClick={this.replaceSkill}>
                  Update and force re-evaluation</Button>
                <Button bsStyle="danger" onClick={this.removeSkill} className="skill-details__action-btn--right">
                  Remove from template</Button>
              </ButtonToolbar>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModel}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default SkillDetailsModal;
