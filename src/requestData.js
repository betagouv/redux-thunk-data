import {
  fetchToSuccessOrFailData,
  requestData as _requestData,
} from 'fetch-normalize-data'

export const requestData = config => (dispatch, getState, defaultConfig) => {
  const { data } = getState()
  const reducer = [data, dispatch]
  const fetchConfig = { ...defaultConfig, ...config }
  dispatch(_requestData(config))
  return fetchToSuccessOrFailData(reducer, fetchConfig)
}

export default requestData
