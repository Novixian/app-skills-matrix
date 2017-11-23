import * as React from 'react';
import { Grid, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import MatricesActions from './MatricesActions';
import TemplateList from './TemplateList';

type ManageTemplatesPageComponentProps = {
  templates: TemplateViewModel[],
};

export const ManageTemplatesPageComponent = ({ templates }: ManageTemplatesPageComponentProps) =>
  (
    <Grid>
      <Row>
        <Col md={6}>
          <TemplateList templates={templates}/>
        </Col>
        <Col md={6}>
          <MatricesActions />
        </Col>
      </Row>
    </Grid>
  );

export const ManageTemplatesPage = connect(
  state => state.matrices,
)(ManageTemplatesPageComponent);
