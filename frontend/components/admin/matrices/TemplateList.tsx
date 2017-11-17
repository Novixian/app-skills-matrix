import * as React from 'react';
import { Panel, ListGroup, ListGroupItem, Glyphicon } from 'react-bootstrap';
import { Link } from 'react-router';

import './template-list.scss';

const templateRow = ({ id, name }) =>
  <Link
    to={`/admin/templates/${id}`}
    className="list-group-item"
    key={id}>
    {name}
    <Glyphicon glyph="pencil" className="template-list__edit-icon" />
  </Link>;

const TemplateList = ({ templates }: { templates: TemplateViewModel[] }) =>
  <Panel header={<p>Templates</p>} bsStyle="primary" className="template-list__panel">
    <ListGroup fill>
      {
        templates && templates.length > 0
          ? templates.map(templateRow)
          : <ListGroupItem key="No templates">No templates</ListGroupItem>
      }
    </ListGroup>
  </Panel>
;

export default TemplateList;
