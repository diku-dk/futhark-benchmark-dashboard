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
      const {topScores, bottomScores} = action.payload.data
      return {
        ...state,
        loading: false,
        topScores: topScores,
        bottomScores: bottomScores
      }
    }
    default:
      return state
  }
}
