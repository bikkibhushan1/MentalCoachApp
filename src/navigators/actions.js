import {NavigationActions, StackActions} from 'react-navigation';

export const resetToProgramDetails = program => {
  return StackActions.reset({
    index: 2,
    actions: [
      NavigationActions.navigate({routeName: 'Home'}),
      NavigationActions.navigate({routeName: 'MyPrograms'}),
      NavigationActions.navigate({
        routeName: 'ProgramDetails',
        params: {
          program,
        },
      }),
    ],
  });
};

export const resetToSessionDetails = (program, session) => {
  return StackActions.reset({
    index: 2,
    actions: [
      NavigationActions.navigate({routeName: 'Home'}),
      NavigationActions.navigate({
        routeName: 'ProgramDetails',
        params: {
          program,
        },
      }),
      NavigationActions.navigate({
        routeName: 'SessionDetails',
        params: {
          session,
          program,
        },
      }),
    ],
  });
};

export const resetToChat = channel => {
  return StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({routeName: 'Home'}),
      NavigationActions.navigate({
        routeName: 'Chat',
        params: {
          channel,
        },
      }),
    ],
  });
};
