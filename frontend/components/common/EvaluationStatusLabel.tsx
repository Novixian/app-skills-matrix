import * as React from 'react';
import { Label, Glyphicon } from 'react-bootstrap';

import { humanReadableStatus } from '../common/helpers';
import { EVALUATION_STATUS } from '../../modules/user/evaluations';
const { NEW, SELF_EVALUATION_COMPLETE, MENTOR_REVIEW_COMPLETE, COMPLETE } = EVALUATION_STATUS;

type EvaluationStatusLabelProps = {
  status: string,
  editable?: boolean,
  handleEditClick?: () => void,
};

const labelInit = (editable: boolean, handleEditClick: () => void) =>
  (status: string, style: string) => (
    <h4>
      <Label bsStyle={style}>
        {humanReadableStatus[status]}{' '}
        {
          editable
            ? <Glyphicon glyph="pencil" className="edit-icon" onClick={handleEditClick}/>
            : false
        }
      </Label>
    </h4>
  );

const EvaluationStatusLabel = ({ status, editable = false, handleEditClick }: EvaluationStatusLabelProps) => {
  const label = labelInit(editable, handleEditClick);

  switch (status) {
    case NEW:
      return label(NEW, 'primary');
    case SELF_EVALUATION_COMPLETE:
      return label(SELF_EVALUATION_COMPLETE, 'info');
    case MENTOR_REVIEW_COMPLETE:
      return label(MENTOR_REVIEW_COMPLETE, 'success');
    case COMPLETE:
      return label(COMPLETE, 'success');
    default:
      return (<h4><Label bsStyle="error">You shouldn't see this</Label></h4>);
  }
};

export default EvaluationStatusLabel;
