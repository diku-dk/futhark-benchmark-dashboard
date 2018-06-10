import { history } from '../store'
import { reduce } from './reducer'
import _ from 'lodash'

function updateUrl(state, location) {
  if ('URLSearchParams' in window) {
    var searchParams = new URLSearchParams(location.search)
    let selected = []

    for (let selection of state.selected) {
      selected.push([selection.backend, selection.machine, selection.commit])
    }

    searchParams.set("selected", JSON.stringify(selected))
    if ( '?' + searchParams.toString() !== location.search ) {
      history.push({
        search: '?' + searchParams.toString()
      })
    }
  }
}

export const updateInUrl = (action) => {
  return ({dispatch, getState}) => {
    const state = getState()
    let newState = reduce(_.cloneDeep(state.compare), action)

    updateUrl(newState, state.routing.location)

    return action
  }
}

export const changeBackend = (index, backend) => updateInUrl({
  type: 'COMPARE_CHANGE_BACKEND',
  payload: {
    index,
    backend
  }
})

export const changeMachine = (index, machine) => updateInUrl({
  type: 'COMPARE_CHANGE_MACHINE',
  payload: {
    index,
    machine
  }  
})

export const changeCommit = (index, commit) => updateInUrl({
  type: 'COMPARE_CHANGE_COMMIT',
  payload: {
    index,
    commit
  }  
})

export const changeSelected = (selected) => updateInUrl({
  type: 'COMPARE_CHANGE_SELECTED',
  payload: {
    selected
  }
})
