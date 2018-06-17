import { history } from '../store'
import { reduce } from './reducer'
import _ from 'lodash'

function updateUrl(state, location) {
  if ('URLSearchParams' in window) {
    var searchParams = new URLSearchParams(location.search)
    let selected = []

    for (let selection of state.selected) {
      selected.push([selection.color, selection.backend, selection.machine, selection.benchmark, selection.dataset])
    }

    searchParams.set("selected", JSON.stringify(selected))
    searchParams.set('graphType', state.graphType)
    searchParams.set('slowdownMax', state.slowdownMax)
    searchParams.set('xLeft', state.xLeft)
    searchParams.set('xRight', state.xRight)
    if ('?' + searchParams.toString() !== location.search) {
      history.push({
        search: '?' + searchParams.toString()
      })
    }
  }
}

export const updateInUrl = (action) => {
  return ({dispatch, getState}) => {
    const state = getState()
    let newState = reduce(_.cloneDeep(state.visualize), action)

    updateUrl(newState, state.routing.location)

    return action
  }
}

export const changeGraphZoom = (xLeft, xRight) => updateInUrl({
  type: 'VISUALIZE_CHANGE_GRAPH_ZOOM',
  payload: {
    xLeft,
    xRight
  }
})

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

export const togglePath = (index) => ({
  type: 'VISUALIZE_TOGGLE_PATH',
  payload: {
    index
  }
})

export const changeSelected = (selected) => updateInUrl({
  type: 'VISUALIZE_CHANGE_SELECTED',
  payload: {
    selected
  }
})

export const addPath = () => ({
  type: 'VISUALIZE_ADD_PATH',
  payload: {}
})

export const removePath = (index) => {
  return updateInUrl({
    type: 'VISUALIZE_REMOVE_PATH',
    payload: {
      index
    }
  })
}

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
