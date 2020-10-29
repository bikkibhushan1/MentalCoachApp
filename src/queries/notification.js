import gql from 'graphql-tag';

export const getNotifications = gql`
  query getNotifications {
    getNotifications {
      type
      title
      createdAt
      cohortId
      programId
      coachId
      userEmail
    }
  }
`;
