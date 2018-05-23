export const changeGraphType = (value) => ({
  type: 'VISUALIZE_CHANGE_GRAPH_TYPE',
  payload: {
    value
  }
})

export const changeSpeedMax = (speedUpMax) => ({
  type: 'VISUALIZE_CHANGE_SPEEDUP_MAX',
  payload: {
    speedUpMax
  }
})

export const changeSelected = (selected) => ({
  type: 'VISUALIZE_CHANGE_SELECTED',
  payload: {
    selected
  }
})

export const addPath = () => ({
  type: 'VISUALIZE_ADD_PATH',
  payload: {}
})

export const removePath = (index) => ({
  type: 'VISUALIZE_REMOVE_PATH',
  payload: {
    index
  }
})

export const changeBackend = (index, backend) => ({
  type: 'VISUALIZE_CHANGE_BACKEND',
  payload: {
    index,
    backend
  }
})

export const changeMachine = (index, machine) => ({
  type: 'VISUALIZE_CHANGE_MACHINE',
  payload: {
    index,
    machine
  }  
})

export const changeDataset = (index, dataset) => ({
  type: 'VISUALIZE_CHANGE_DATASET',
  payload: {
    index,
    dataset
  }
})

export const changeBenchmark = (index, benchmark) => ({
  type: 'VISUALIZE_CHANGE_BENCHMARK',
  payload: {
    index,
    benchmark,
    dataset: null
  }
})
