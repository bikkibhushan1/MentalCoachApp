import gql from 'graphql-tag';

export const getLookupValuesQuery = gql`
  query getLookupValues($keyname: String!) {
    getLookupValues(keyName: $keyname) {
      keyName
      value {
        name
        color
      }
      icon
    }
  }
`;
