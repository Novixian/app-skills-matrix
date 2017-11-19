import * as React from 'react';
import { connect } from 'react-redux';
import { Image, Button, Col, Grid, Row, Tabs, Tab, Badge } from 'react-bootstrap';

import Tasks from './Tasks';
import UserDetails from './UserDetails';
import EvaluationsList from './EvaluationsList';
import UserEvaluations from './UserEvaluations';
import * as selectors from '../../../modules/user';
import { actionCreators as menteeViewActionCreators } from '../../../modules/user/ui/menteeEvaluations';
import { actionCreators as reportViewActionCreators } from '../../../modules/user/ui/reportEvaluations';
import { gitHubAuth } from '../../common/constants/index';

const GitHubLogo = require('../../../img/GitHub-Light.png');
import './dashboard.scss';

type DashboardProps = UserInitialState & { taskCount: number };

const tasksTabTitle = (taskCount): any => <span>Tasks{' '}<Badge className="tasks__count">{taskCount}</Badge></span>;

const Dashboard = ({ userDetails, mentorDetails, lineManagerDetails, template, evaluations, mentees, reports, taskCount }: DashboardProps) => {
  if (!userDetails) {
    return (
      <Grid>
        <Button
          bsStyle="primary"
          bsSize="large"
          href={gitHubAuth}>
          <Image src={GitHubLogo} height={24} />
          {' '}Log in with GitHub
        </Button>
      </Grid>
    );
  }

  return (
    <Grid>
      <Tabs defaultActiveKey={1} id="dashboard-tabs">
        <Tab eventKey={1} title={tasksTabTitle(taskCount)}>
          <Row>
            <Col xs={6} md={6}>
              <Tasks userId={userDetails.id}/>
            </Col>
          </Row>
        </Tab>
        <Tab eventKey={2} title="My evaluations">
          <Row>
            <Col xs={12} md={12}>
              <EvaluationsList evaluations={evaluations} />
            </Col>
          </Row>
        </Tab>
        <Tab eventKey={3} title="Mentee evaluations">
          <Row>
            <UserEvaluations
              userIds={mentees}
              selector={selectors.getSelectedMentee}
              selectUser={menteeViewActionCreators.selectUser}
              userType="mentee"
            />
          </Row>
        </Tab>
        <Tab eventKey={4} title="Team member evaluations">
          <Row>
            <UserEvaluations
              userIds={reports}
              selector={selectors.getSelectedReport}
              selectUser={reportViewActionCreators.selectUser}
              userType="team member"
            />
          </Row>
        </Tab>
        <Tab eventKey={5} title="My details">
          <Row>
            <Col xs={12} md={12}>
              <UserDetails
                user={userDetails}
                mentor={mentorDetails}
                lineManager={lineManagerDetails}
                template={template}
              />
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Grid>
  );
};

export const DashboardPage = connect(
  (state) => {
    return ({
      ...state.user,
      taskCount: selectors.getTaskCount(state),
    });
  },
)(Dashboard);
