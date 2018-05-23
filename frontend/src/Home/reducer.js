const initialState = {
  topScores: [],
  bottomScores: [],
  loading: false
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'GET_HOME_DASHBOARD_START': {
      return {
        ...state,
        loading: true
      }
    }
    
    case 'GET_HOME_DASHBOARD_SUCCESS': {
      return {
        ...state,
        loading: false,
        topScores: action.payload.topScores,
        bottomScores: action.payload.bottomScores
      }
    }
    default:
      return state
  }
}
