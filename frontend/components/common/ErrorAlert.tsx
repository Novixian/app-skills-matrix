import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

type ErrorAlert = {
  messageContext: string,
  error?: { message: string },
};

const ErrorAlert = ({ messageContext, error }: ErrorAlert) => {
  if (error) {
    return (
      <Alert bsStyle="danger">
        {`${messageContext}${error.message ? ':' : ''} ${error.message}`}
      </Alert>
    );
  }

  return null;
};

export default ErrorAlert;
