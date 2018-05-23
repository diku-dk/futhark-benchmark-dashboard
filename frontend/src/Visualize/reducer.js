import _ from 'lodash'

const initialState = {
  selected: [
    {
      backend: 'opencl',
      machine: 'GTX780',
      benchmark: 'futhark-benchmarks/misc/radix_sort/radix_sort.fut',
      dataset: 'data/radix_sort_100.in'
    },
    {
      backend: 'opencl',
      machine: 'GTX780',
      benchmark: 'futhark-benchmarks/misc/radix_sort/radix_sort.fut',
      dataset: '#0'
    }
  ],
  graphType: 'speedup',
  speedUpMax: 2
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'VISUALIZE_CHANGE_GRAPH_TYPE': {
      const {value} = action.payload
      return {
        ...state,
        graphType: value ? 'speedup' : 'absolute'
      }
    }
    case 'VISUALIZE_CHANGE_SPEEDUP_MAX': {
      const {speedUpMax} = action.payload
      return {
        ...state,
        speedUpMax
      }
    }
    case 'VISUALIZE_ADD_PATH': {
      const {selected} = state
      selected.push({
        backend: null,
        machine: null,
        benchmark: null,
        dataset: null
      })
      return {
        ...state,
        selected 
      }
    }
    case 'VISUALIZE_CHANGE_SELECTED': {
      const {selected} = action.payload
      return {
        ...state,
        selected
      }
    }
    case 'VISUALIZE_CHANGE_MACHINE':
    case 'VISUALIZE_CHANGE_DATASET':
    case 'VISUALIZE_CHANGE_BACKEND':
    case 'VISUALIZE_CHANGE_BENCHMARK': {
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
    case 'VISUALIZE_REMOVE_PATH': {
      const {selected} = state
      const {index} = action.payload
      selected.splice(index, 1)
      return {
        ...state,
        selected 
      }
    }
    default: {
      return state
    }
  }
}
