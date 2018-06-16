import _ from 'lodash'

const initialState = {
  selected: [
  ],
  colors: [
    '230,25,75',
    '60,180,75',
    '255,225,25',
    '0,130,200',
    '245,130,48',
    '145,30,180',
    '70,240,240',
    '240,50,230',
    '210,245,60',
    '250,190,190',
    '0,128,128',
    '230,190,255',
    '170,110,40',
    '255,250,200',
    '128,0,0',
    '170,255,195',
    '128,128,0',
    '255,215,180',
    '0,0,128',
    '128,128,128',
    '0,0,0'
  ],
  graphType: 'slowdown',
  slowdownMax: 2,
  xLeft: 0,
  xRight: 100
}

const getColor = (colorList, selected) => {
  let color = colorList.shift()

  const colorInUse = () => selected.find(element => element.color === color)

  while ( colorInUse() ) {
    color = getColor(colorList, selected)
  }

  return color
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
      let {selected, colors} = state
      selected.push({
        backend: null,
        machine: null,
        benchmark: null,
        dataset: null,
        active: true,
        colors: getColor(colors, selected)
      })
      return {
        ...state,
        colors: colors,
        selected 
      }
    }
    case 'VISUALIZE_CHANGE_SELECTED': {
      let {colors} = state
      const {selected} = action.payload

      return {
        ...state,
        selected: selected.map(item => {
          if (item.color == null) {
            item.color = getColor(colors, selected)
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
