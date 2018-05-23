import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import reducer from './reducer'
import homeReducer from '../Home/reducer'
import visualizeReducer from '../Visualize/reducer'
import compareReducer from '../Compare/reducer'

export default combineReducers({
  routing: routerReducer,
  data: reducer,
  home: homeReducer,
  visualize: visualizeReducer,
  compare: compareReducer
})
