import gql from 'graphql-tag';

export const addProgramSchedule = gql`
  mutation addProgramSchedule(
    $programId: ID!
    $schedule: ProgramScheduleInput!
  ) {
    addProgramSchedule(programId: $programId, schedule: $schedule) {
      id
    }
  }
`;

export const addProgramTaskSchedule = gql`
  mutation addProgramTaskSchedule(
    $programId: ID!
    $schedule: ProgramTaskScheduleInput!
  ) {
    addProgramTaskSchedule(programId: $programId, schedule: $schedule) {
      id
    }
  }
`;

export const editProgramSession = gql`
  mutation editProgramSession($sessionId: ID!, $session: ProgramSessionInput!) {
    editProgramSession(sessionId: $sessionId, session: $session) {
      id
    }
  }
`;

export const editProgramTask = gql`
  mutation editProgramTask($taskId: ID!, $session: ProgramTaskInput!) {
    editProgramTask(taskId: $taskId, session: $session) {
      id
    }
  }
`;

export const getAllHomeworkItems = gql`
  query getAllHomeworkItems($app: HomeworkApp!) {
    getAllHomeworkItems(app: $app) {
      exercises {
        id
        module
        title
      }
      lesson {
        id
        title
      }
      practiceIdea {
        id
        title
      }
      meditations {
        id
        title
      }
    }
  }
`;

export const getSessionsCalendarView = gql`
  query getSessionsCalendarView($startDate: String!, $endDate: String!) {
      getSessionsCalendarView   (startDate:$startDate, endDate:$endDate) {
        		date     
            sessions{ 			
              id       
              coachId       
              moduleId       
              name       
              image       
              description       
              type       
              instructions       
              startDate       
              createdAt   	
            }   
          } 
      }
  
`;
