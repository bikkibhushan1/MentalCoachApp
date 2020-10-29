import gql from 'graphql-tag';

export const getUser = gql`
  query getUser {
    getUser {
      userId
      name
      email
      picture
      gender
      address {
        city
        country
        zip
      }
      payment
      hasPractice
      isMentor
      featuredCoach
      categories
      isCoach
    }
  }
`;

export const editUser = gql`
  mutation editUser($user: UserInput!) {
    editUser(user: $user) {
      userId
      name
      email
      picture
      gender
      address {
        city
        country
        zip
      }
      payment
      hasPractice
      isMentor
      featuredCoach
      categories
      isCoach
    }
  }
`;

export const getPractice = gql`
  query getPractice {
    getPractice {
      title
      description
      lastUpdatedOn
    }
  }
`;

export const upsertPractice = gql`
  mutation upsertPractice($practice: PracticeInput!, $categories: [String!]!) {
    upsertPractice(practice: $practice, categories: $categories) {
      title
    }
  }
`;

export const getPrograms = gql`
  query getPrograms {
    getPrograms {
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

export const getJoinedPrograms = gql`
  query getJoinedCohorts {
    getJoinedCohorts {
      id
      coachId
      coach {
        name
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
      gradient
      coCoach {
        name
        picture
      }
      startDate
      endDate
    }
  }
`;

export const searchCoaches = gql`
  query searchCoaches($featuredCoach: Boolean, $isMentor: Boolean) {
    searchCoaches(featuredCoach: $featuredCoach, isMentor: $isMentor) {
      userId
      name
      picture
      categories
      isMentor
      featuredCoach
      practice {
        title
        description
      }
      programs {
        id
        name
        description
        image
        type
        isFree
        startDate
        tags
        app
      }
    }
  }
`;

export const authenticateStripeToken = gql`
  mutation authenticateStripeToken($token: String!) {
    authenticateStripeToken(token: $token) {
      success
    }
  }
`;

export const requestCoachAccess = gql`
  mutation requestCoachAccess {
    requestCoachAccess {
      success
      message
    }
  }
`;
