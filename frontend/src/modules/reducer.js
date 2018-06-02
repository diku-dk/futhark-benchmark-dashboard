import _ from 'lodash'

const initialState = {
  skeleton: null,
  benchmarks: null,
  commits: [],
  colors: [
    "75,192,192",
    "255,138,128",
    "48,79,254",
    "0,105,92",
    "76,175,80",
    "238,255,65",
    "255,193,7",
    "121,85,72"
  ],
  loading: []

}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'GET_FETCH_BACKEND_MACHINE_START': {
      let {loading} = state
      const {
        backend,
        machine
      } = action.meta
      loading.push(`${backend}/${machine}`)
      return {
        ...state,
        loading
      }
    }
    case 'GET_FETCH_BACKEND_MACHINE_SUCCESS': {
      let {
        skeleton,
        loading
      } = state
      const {
        backend,
        machine
      } = action.payload
      _.set(skeleton, [backend, machine], action.payload.data)

      if (loading.includes(`${backend}/${machine}`)) {
        loading.splice(loading.indexOf(`${backend}/${machine}`), 1)
      }

      return {
        ...state,
        skeleton,
        loading: loading
      }
    }
    case 'GET_METADATA_SUCCESS': {
      const {benchmarks, skeleton, commits} = action.payload.data
      return {
        ...state,
        benchmarks,
        skeleton,
        commits
      }
    }
    default:
      return state
  }
}
