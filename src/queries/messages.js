import gql from 'graphql-tag';

export const getTwilioToken = gql`
  query getTwilioToken($device: DeviceType!) {
    getTwilioToken(device: $device) {
      identity
      token
    }
  }
`;

export const getAllChannels = gql`
  query getAllChannels {
    getAllChannels {
      channelId
      members {
        userId
        name
        email
        picture
      }
      channelType
      displayName
      displayImage
      createdAt
      cohortId
      memberId
      cohort {
        id
        coachId
        programId
        startDate
        endDate
        name
        image
      }
    }
  }
`;

export const createDirectChannel = gql`
  mutation createDirectChannel($userId: ID!) {
    createDirectChannel(userId: $userId) {
      channelId
      displayName
      displayImage
    }
  }
`;

export const startVideoSession = gql`
  mutation startVideoSession($cohortId: ID!, $sessionId: ID!) {
    startVideoSession(cohortId: $cohortId, sessionId: $sessionId) {
      roomName
      accessToken
    }
  }
`;
