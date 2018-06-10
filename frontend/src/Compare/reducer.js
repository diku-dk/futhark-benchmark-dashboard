import _ from 'lodash'

const initialState = {
  selected: [
    {
      backend: 'opencl',
      machine: 'GTX780',
      commit: '0397438e8fc6cd2e5549a9d883d1e5a5c11110f7'
    },
    {
      backend: 'opencl',
      machine: 'GTX780',
      commit: '009795e2ccdf19374113efe74586a472cba40581'
    }
  ]
}

export const reduce = (state, action) => {
  switch (action.type) {
    case 'COMPARE_CHANGE_SELECTED': {
      const {selected} = action.payload
      return {
        ...state,
        selected
      }
    }
    case 'COMPARE_CHANGE_MACHINE':
    case 'COMPARE_CHANGE_BACKEND': {
      const {selected} = state
      const {index, ...other} = action.payload
      selected[index] = _.merge(selected[index], {
        ...other
      })

      return {
        ...state,
        selected
      }
    }
    case 'COMPARE_CHANGE_COMMIT': { 
      const {selected} = state
      const {index, commit} = action.payload

      selected[index] = _.merge(selected[index], {
        commit
      })

      return {
        ...state,
        selected
      }  
    }
    default:
      return state
  }
}

export default (state = initialState, action) => reduce(state, action)
