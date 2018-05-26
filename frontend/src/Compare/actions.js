export const changeBackend = (index, backend) => ({
  type: 'COMPARE_CHANGE_BACKEND',
  payload: {
    index,
    backend
  }
})

export const changeMachine = (index, machine) => ({
  type: 'COMPARE_CHANGE_MACHINE',
  payload: {
    index,
    machine
  }  
})

export const changeCommit = (index, commit) => ({
  type: 'COMPARE_CHANGE_COMMIT',
  payload: {
    index,
    commit
  }  
})

export const changeSelected = (selected) => ({
  type: 'COMPARE_CHANGE_SELECTED',
  payload: {
    selected
  }
})
