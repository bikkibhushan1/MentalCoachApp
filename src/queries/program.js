import gql from 'graphql-tag';

export const addProgramMutation = gql`
  mutation addProgram($program: ProgramInput!) {
    addProgram(program: $program) {
      id
    }
  }
`;

export const editProgramMutation = gql`
  mutation editProgram($programId: ID!, $program: ProgramInput!) {
    editProgram(programId: $programId, program: $program) {
      id
    }
  }
`;

export const getFeaturedPrograms = gql`
  query getFeaturedPrograms {
    getFeaturedPrograms {
      id
      coachId
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
      instructions
      tags
      app
      status
      gradient
      hideFromSearch
      closedToNewRequest
      isFeatured
    }
  }
`;

export const getProgramWithSchedules = gql`
  query getProgramWithSchedules($programId: ID!) {
    getProgramWithSchedules(programId: $programId) {
      id
      coachId
      coach {
        userId
        name
        email
        picture
      }
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
      status
      gradient
      invites {
        email
        createdAt
        status
      }
      hideFromSearch
      closedToNewRequest
      cohorts {
        id
        startDate
        endDate
        name
        joinedMembers
        programSize
        canViewDetails
      }
      sessions {
        id
        coachId
        programId
        moduleId
        name
        module
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
        relativeStartDate {
          period
          interval
        }
        relativeDays
        image
      }
      coCoach {
        userId
        name
        email
        picture
      }
    }
  }
`;

export const getCohort = gql`
  query getCohort($cohortId: ID!) {
    getCohort(cohortId: $cohortId) {
      program {
        id
        coachId
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
        canViewDetails
        invites {
          email
          createdAt
          status
        }
      }
      sessions {
        id
        cohortId
        coachId
        moduleId
        name
        module
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
      }
    }
  }
`;

export const getProgramSessions = gql`
  query getProgramSessions($programId: ID!) {
    getProgramSessions(programId: $programId) {
      id
      name
      module
      description
      type
      startDate
      assessments
      payment
      isFree
    }
  }
`;

export const inviteUserToProgram = gql`
  mutation inviteUserToProgram($programId: ID!, $email: String!) {
    inviteUserToProgram(programId: $programId, email: $email) {
      success
      message
    }
  }
`;

export const getAllPrograms = gql`
  query getAllPrograms($lastKey: AllProgramsInputKey) {
    getAllPrograms(lastKey: $lastKey) {
      items {
        id
        coachId
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
        status
        gradient
      }
    }
    LastEvaluatedKey {
      id
      coachId
    }
    Count
  }
`;

export const getProgramsByCoach = gql`
  query getProgramsByCoach($coachId: ID!) {
    getProgramsByCoach(coachId: $coachId) {
      id
      coachId
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
      status
      gradient
    }
  }
`;

export const deleteProgram = gql`
  mutation deleteProgram($programId: ID!) {
    deleteProgram(programId: $programId) {
      success
      message
    }
  }
`;

export const getProgramJoinRequests = gql`
  query getProgramJoinRequests($programId: ID!) {
    getProgramJoinRequests(programId: $programId) {
      userId
      cohortId
      createdAt
      name
      picture
    }
  }
`;

export const deleteProgramModules = gql`
  mutation deleteProgramModules($programId: ID!, $moduleId: ID!) {
    deleteProgramModules(programId: $programId, moduleId: $moduleId) {
      success
      message
    }
  }
`;

export const deleteProgramTaskAndSession = gql`
  mutation deleteProgramTaskAndSession($programId: ID!, $sessionId: ID!) {
    deleteProgramTaskAndSession(programId: $programId, sessionId: $sessionId) {
      success
      message
    }
  }
`;

export const addCoCoach = gql`
  mutation addCoCoach($programId: ID, $cohortId: ID, $coachId: [ID!]!) {
    addCoCoach(programId: $programId, cohortId: $cohortId, coachId: $coachId) {
      success
      message
    }
  }
`;
