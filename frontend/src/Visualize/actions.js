import { history } from '../store'
import { reduce } from './reducer'

function updateUrl(state) {
  if ('URLSearchParams' in window) {
    var searchParams = new URLSearchParams(window.location.search)
    let selected = []

    for (let selection of state.selected) {
      selected.push([selection.backend, selection.machine, selection.benchmark, selection.dataset])
    }

    searchParams.set("selected", JSON.stringify(selected))
    searchParams.set('graphType', state.graphType)
    searchParams.set('slowdownMax', state.slowdownMax)
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString()
    history.push(newRelativePathQuery)
  }
}

export const updateInUrl = (action) => {
  return ({dispatch, getState}) => {
    const state = getState().visualize
    let newState = reduce(state, action)

    updateUrl(newState)

    return action
  }
}

export const changeGraphType = (value) => updateInUrl({
  type: 'VISUALIZE_CHANGE_GRAPH_TYPE',
  payload: {
    value
  }
})

export const changeSlowdownMax = (slowdownMax) => {
  if (slowdownMax > 0) {
    return updateInUrl({
      type: 'VISUALIZE_CHANGE_SLOWDOWN_MAX',
      payload: {
        slowdownMax
      }
    })
  }

  return {
    type: ''
  }
}

export const changeSelected = (selected) => updateInUrl({
  type: 'VISUALIZE_CHANGE_SELECTED',
  payload: {
    selected
  }
})

export const addPath = () => updateInUrl({
  type: 'VISUALIZE_ADD_PATH',
  payload: {}
})

export const removePath = (index) => updateInUrl({
  type: 'VISUALIZE_REMOVE_PATH',
  payload: {
    index
  }
})

export const changeBackend = (index, backend) => updateInUrl({
  type: 'VISUALIZE_CHANGE_BACKEND',
  payload: {
    index,
    backend
  }
})

export const changeMachine = (index, machine) => updateInUrl({
  type: 'VISUALIZE_CHANGE_MACHINE',
  payload: {
    index,
    machine
  }  
})

export const changeDataset = (index, dataset) => updateInUrl({
  type: 'VISUALIZE_CHANGE_DATASET',
  payload: {
    index,
    dataset
  }
})

export const changeBenchmark = (index, benchmark) => updateInUrl({
  type: 'VISUALIZE_CHANGE_BENCHMARK',
  payload: {
    index,
    benchmark,
    dataset: null
  }
})
