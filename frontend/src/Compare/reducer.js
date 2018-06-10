import _ from 'lodash'

const initialState = {
  selected: [
    {
      backend: 'opencl',
      machine: 'GTX780',
      commit: '7fb9cec07ad4de80c65f7684b24d1f3cb2ab171a',
      file: null,
      data: null
    },
    {
      backend: 'opencl',
      machine: 'GTX780',
      commit: '009795e2ccdf19374113efe74586a472cba40581',
      file: null,
      data: null
    }
  ]
}

const average = (data) => data.reduce((sum, value) => sum + value, 0) / data.length

export const reduce = (state, action) => {
  switch (action.type) {
    case 'COMPARE_CHANGE_SELECTED': {
      const {selected} = action.payload
      return {
        ...state,
        selected
      }
    }
    case 'COMPARE_CHANGE_FILE': {
      const {selected} = state
      const {index, file, data} = action.payload

      for (const benchmarkKey in data) {
        const benchmark = data[benchmarkKey]

        for (const datasetKey in benchmark['datasets']) {
          let dataset = benchmark['datasets'][datasetKey]

          if (_.has(data, [benchmarkKey, 'datasets', datasetKey])) {
            dataset['avg'] = average(dataset['runtimes'])
          }
        }
      }

      selected[index] = _.merge(selected[index], {
        backend: null,
        machine: null,
        commit: null,
        file: file,
        data: data
      })

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
        file: null,
        data: null,
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
        file: null,
        data: null,
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
