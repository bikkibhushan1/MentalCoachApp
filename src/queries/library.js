import gql from 'graphql-tag';

export const getLibraryItems = gql`
  query getLibraryItems {
    getLibraryItems {
      links
      pdfs
      images
    }
  }
`;

export const addLibraryItems = gql`
  mutation addLibraryItems($libraryItems: UserLibraryInput!) {
    addLibraryItems(libraryItems: $libraryItems) {
      links
      pdfs
      images
    }
  }
`;

export const removeLibraryItems = gql`
  mutation removeLibraryItems($libraryItems: UserLibraryInput!) {
    removeLibraryItems(libraryItems: $libraryItems) {
      success
      message
    }
  }
`;
