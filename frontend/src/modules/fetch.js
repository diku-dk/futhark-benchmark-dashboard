import axios from 'axios'
import pako from 'pako'

const fetch = (name, file, skip, options = {}) => {
  return ({dispatch, getState}) => {
    const state = getState()

    if (skip(state)) {
      return {
        type: ''
      }
    }

    async function getPromise() {
      try {
        const gzipped = file.endsWith('.gz')
        const response = await axios(`${process.env.REACT_APP_DATA_URL || 'http://localhost:8080'}/${file}`, {
          mode: "cors",
          responseType: gzipped ? 'arraybuffer' : 'json'
        })

        if (response.status !== 200 && response.status !== 304) {
          throw response
        }

        if (gzipped) {
          return {
            data: JSON.parse(pako.inflate(response.data, {to: 'string'})),
            ...options
          }
        } else {
          return {
            data: response.data,
            ...options
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          throw e
        }
      }
    }

    return {
      type: `GET_${name}`,
      meta: {
        ...options
      },
      payload: {
        promise: getPromise(),
      }
    }
  }
}

export default fetch
