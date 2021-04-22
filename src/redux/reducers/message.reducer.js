import { combineReducers } from 'redux';

// Stores all messages (conversations) between a user and their contacts
const allMessagesReducer = (state = [{
  companyName: '',
  firstName: '',
  lastName: '',
  otherUserId: 0,
  userId: 0,
  messageDate: '',
  message: '',
  profilePic: ''
}], action) => {
  switch (action.type) {
    case 'SET_ALL_MESSAGES':
      return action.payload;
    default:
      return state;
  }
}

// Stores all messages from a single conversation between a user and a single contact 
const chatReducer = (state = [{
  toUser: 0,
  fromUser: 0,
  dateReceived: '',
  message: ''
}], action) => {
  switch (action.type) {
    case 'ADD_MESSAGE_TO_CHAT':
      return [...state, action.payload];
    case 'SET_MESSAGES':
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({ chatReducer, allMessagesReducer });
