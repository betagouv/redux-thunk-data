import {
  fetchToSuccessOrFailData,
  requestData as _requestData,
  selectRequestByConfig,
} from 'fetch-normalize-data'

export const requestData = config => (dispatch, getState, defaultConfig) => {
  const state = getState()
  const reducer = [state.data, dispatch]
  const fetchConfig = { ...defaultConfig, ...config }

  const { requestOnlyOnce } = config || {}
  if (requestOnlyOnce) {
    const { isSuccess } = selectRequestByConfig(state, config) || {}
    if (isSuccess) return
  }

  dispatch(_requestData(config))

  return fetchToSuccessOrFailData(reducer, fetchConfig)
}

export default requestData
