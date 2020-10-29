import gql from 'graphql-tag';

export const addCohortSchedule = gql`
  mutation addCohortSchedule(
    $cohortId: ID!
    $schedule: CohortScheduleInput!
    $addToProgram: Boolean
  ) {
    addCohortSchedule(
      cohortId: $cohortId
      schedule: $schedule
      addToProgram: $addToProgram
    ) {
      id
    }
  }
`;

export const addCohortTaskSchedule = gql`
  mutation addCohortTaskSchedule(
    $cohortId: ID!
    $schedule: CohortTaskScheduleInput!
    $addToProgram: Boolean
  ) {
    addCohortTaskSchedule(
      cohortId: $cohortId
      schedule: $schedule
      addToProgram: $addToProgram
    ) {
      id
    }
  }
`;

export const editCohortSession = gql`
  mutation editCohortSession($sessionId: ID!, $session: CohortSessionInput!) {
    editCohortSession(sessionId: $sessionId, session: $session) {
      id
    }
  }
`;

export const editCohortTask = gql`
  mutation editCohortTask($taskId: ID!, $session: CohortTaskInput!) {
    editCohortTask(taskId: $taskId, session: $session) {
      id
    }
  }
`;

export const addCohort = gql`
  mutation addCohort($programId: ID!, $startDate: String!) {
    addCohort(programId: $programId, startDate: $startDate) {
      id
    }
  }
`;

export const getCohort = gql`
  query getCohort($cohortId: ID!) {
    getCohort(cohortId: $cohortId) {
      id
      coachId
      coach {
        userId
        name
        email
        picture
      }
      programId
      name
      description
      image
      type
      programSize
      duration {
        period
        interval
      }
      payment
      isFree
      documents
      tags
      app
      startDate
      createdAt
      channelId
      joinedMembers
      canViewDetails
      invites {
        email
        createdAt
        status
      }
      sessions {
        id
        coachId
        moduleId
        cohortId
        name
        module
        image
        description
        type
        material {
          links
          images
          pdfs
          appcontents {
            lessons
            exercises
            practiceIdeas
            meditations
          }
        }
        startDate
        createdAt
        canViewDetails
        videoSession {
          roomName
          accessToken
        }
        userResponse {
          userId
          title
          description
        }
      }
      gradient
      coCoach {
        userId
        name
        email
        picture
      }
    }
  }
`;

export const getCohortClients = gql`
  query getCohortClients($cohortId: ID!) {
    getCohortClients(cohortId: $cohortId) {
      userId
      name
      email
      phone
      picture
      joiningDate
    }
  }
`;

export const editCohortMutation = gql`
  mutation editCohort($cohortId: ID!, $cohort: CohortInput!) {
    editCohort(cohortId: $cohortId, cohort: $cohort) {
      id
    }
  }
`;

export const inviteUserToCohort = gql`
  mutation inviteUserToCohort($cohortId: ID!, $email: String!) {
    inviteUserToCohort(cohortId: $cohortId, email: $email) {
      success
      message
    }
  }
`;

export const joinCohort = gql`
  mutation joinCohort($input: JoinCohortInput!) {
    joinCohort(input: $input) {
      success
      message
    }
  }
`;

export const approveCohortJoinRequest = gql`
  mutation approveCohortJoinRequest($cohortId: ID!, $userId: ID!) {
    approveCohortJoinRequest(cohortId: $cohortId, userId: $userId) {
      success
      message
    }
  }
`;

export const rejectCohortJoinRequest = gql`
  mutation rejectCohortJoinRequest($cohortId: ID!, $userId: ID!) {
    rejectCohortJoinRequest(cohortId: $cohortId, userId: $userId) {
      success
      message
    }
  }
`;

export const deleteCohortTaskAndSession = gql`
  mutation deleteCohortTaskAndSession($cohortId: ID!, $sessionId: ID!) {
    deleteCohortTaskAndSession(cohortId: $cohortId, sessionId: $sessionId) {
      success
      message
    }
  }
`;
