import fetch from './fetch'
import _ from 'lodash'

export const fetchBackendMachine = (backend, machine) => fetch('FETCH_BACKEND_MACHINE', `data-split/${backend}/${machine}-optimized.json.gz`, state => {
  const {skeleton, loading} = state.data
  return ! (
    skeleton !== null &&
    backend !== null &&
    machine !== null &&
    ! loading.includes(`${backend}/${machine}`) &&
    _.has(skeleton, [backend, machine]) &&
    Object.keys(skeleton[backend][machine]).length === 0
  )
}, {backend, machine})

export const fetchMetadata = () => fetch('METADATA', 'metadata.json.gz', state => {
  return state.data.skeleton !== null
})
