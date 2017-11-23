import * as React from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  ButtonToolbar,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';

import './editable-list.scss';

const moveItem = (arr, fromIndex, toIndex) => arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);

const updateItem = (array, value, index) => {
  array[index] = value;
  return array;
};

const moveItemUp = (array, index) => {
  moveItem(array, index, index - 1);
  return array;
};

const moveItemDown = (array, index) => {
  moveItem(array, index, index + 1);
  return array;
};

const removeItem = (array, index) => {
  array.splice(index, 1);
  return array;
};

const addItem = (array) => {
  array.push('');
  return array;
};

type EditableListProps = {
  title: string,
  placeholder: string,
  array: string[],
  onUpdate: (array: string[]) => void,
  addBtnName: string,
  infoText?: string,
};

const tooltip = (title, text) => (
  <OverlayTrigger
    trigger={['hover', 'focus']}
    placement="right"
    overlay={<Popover id={title}>{text}</Popover>}
  >
    <Glyphicon glyph="info-sign"/>
  </OverlayTrigger>
);

const EditableList = ({ title, addBtnName, placeholder, array, onUpdate, infoText }: EditableListProps) => (
  <FormGroup>
    <ControlLabel>{title}{' '}{infoText ? tooltip(title, infoText) : null}</ControlLabel>
    {
      array.map((c, index) => (
        <div key={`${placeholder}_${index}`}className="editable-list__row">
          <FormControl
            className="editable-list__row-input"
            name={`${placeholder}_${index}`}
            type="text"
            value={c}
            onChange={(e: any) => onUpdate(updateItem(array, e.target.value, index))}
            placeholder={placeholder}
          />
          <ButtonToolbar className="editable-list__row-btn-toolbar">
            <Button onClick={() => onUpdate(moveItemUp(array, index))}>
              <Glyphicon glyph="arrow-up"/>
            </Button>
            <Button onClick={() => onUpdate(moveItemDown(array, index))}>
              <Glyphicon glyph="arrow-down"/>
            </Button>
            <Button onClick={() => onUpdate(removeItem(array, index))}>
              <Glyphicon glyph="remove"/>
            </Button>
          </ButtonToolbar>
        </div>
      ))
    }
    <Button onClick={() => onUpdate(addItem(array))} block>
      <Glyphicon glyph="plus"/>{' '}{addBtnName}
    </Button>
  </FormGroup>
);

export default EditableList;
