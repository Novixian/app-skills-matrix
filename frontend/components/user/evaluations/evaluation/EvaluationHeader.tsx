import * as React from 'react';
import { default as AnimateOnChange } from 'react-animate-on-change';
import { Col, ButtonToolbar, ButtonGroup, Button, Glyphicon } from 'react-bootstrap';

import '../evaluation.scss';

type CategoryPageHeaderProps = {
  evaluationId: string,
  currentCategory: string,
  isLastCategory: boolean,
  nextCategory: () => void,
  evaluationComplete: (evaluationId: string) => void,
};

class CategoryPageHeader extends React.Component<CategoryPageHeaderProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      newCategory: false,
    };
    this.handleEvalCompleteClick = this.handleEvalCompleteClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentCategory !== nextProps.currentCategory) {
      this.setState({ newCategory: true });
    } else {
      this.setState({ newCategory: false });
    }
  }

  handleEvalCompleteClick() {
    const { evaluationComplete, evaluationId } = this.props;

    this.setState({ isLoading: true });
    setTimeout(() => evaluationComplete(evaluationId), 1000);
  }

  render() {
    const { currentCategory, isLastCategory, nextCategory } = this.props;
    const { isLoading } = this.state;

    return (
      <div>
        <Col md={8} className="evaluation-header">
          <AnimateOnChange
            baseClassName="evaluation-header__category-label"
            animationClassName="evaluation-header__category-label--stretch"
            animate={this.state.newCategory}>
            {currentCategory}
          </AnimateOnChange>
          <ButtonToolbar className="pull-right">
            <ButtonGroup>
              <Button
                disabled={isLastCategory}
                onClick={() => nextCategory()}
                className="evaluation-header__navigation"
              >
                Next category
                {' '}
                <Glyphicon glyph="chevron-right"/>
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
        </Col>
        <Col md={4} className="evaluation-header--right">
          <Button
            bsStyle="success"
            disabled={isLoading}
            onClick={!isLoading ? this.handleEvalCompleteClick : null}
            block
            className="evaluation-header__cta"
          >
            Evaluation complete
          </Button>
        </Col>
      </div>
    );
  }
}

export default CategoryPageHeader;
