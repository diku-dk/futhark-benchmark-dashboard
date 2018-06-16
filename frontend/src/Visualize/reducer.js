import _ from 'lodash'

const initialState = {
  selected: [
  ],
  colors: [
    '75,192,192',
    '255,138,128',
    '48,79,254',
    '0,105,92',
    '76,175,80',
    '238,255,65',
    '255,193,7',
    '121,85,72'
  ],
  graphType: 'slowdown',
  slowdownMax: 2,
  xLeft: 0,
  xRight: 100
}

const getColor = (colorList) => {
  return colorList.pop()
}

export const reduce = (state, action) => {
  switch (action.type) {
    case 'VISUALIZE_TOGGLE_PATH': {
      const {selected} = state
      const {index} = action.payload
      selected[index] = _.merge(selected[index], {
        active: ! selected[index].active
      })

      return {
        ...state,
        selected
      }
    }
    case 'VISUALIZE_CHANGE_GRAPH_TYPE': {
      const {value} = action.payload
      return {
        ...state,
        graphType: value ? 'slowdown' : 'absolute'
      }
    }
    case 'VISUALIZE_CHANGE_GRAPH_ZOOM': {
      const {xLeft, xRight} = action.payload
      return {
        ...state,
        xLeft,
        xRight
      }
    }
    case 'VISUALIZE_CHANGE_SLOWDOWN_MAX': {
      const {slowdownMax} = action.payload
      return {
        ...state,
        slowdownMax
      }
    }
    case 'VISUALIZE_ADD_PATH': {
      const {selected, colors} = state
      selected.push({
        backend: null,
        machine: null,
        benchmark: null,
        dataset: null,
        active: true,
        colors: getColor(colors)
      })
      return {
        ...state,
        colors: colors,
        selected 
      }
    }
    case 'VISUALIZE_CHANGE_SELECTED': {
      const {colors} = state
      const {selected} = action.payload

      return {
        ...state,
        selected: selected.map(item => {
          if (item.color == null) {
            item.color = getColor(colors)
          }
          return item
        }),
        colors: colors
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
      const {selected, colors} = state
      const {index} = action.payload
      const color = selected[index].color
      colors.push(color)
      selected.splice(index, 1)
      return {
        ...state,
        colors: colors,
        selected 
      }
    }
    default: {
      return state
    }
  }
}

export default (state = initialState, action) => reduce(state, action)
