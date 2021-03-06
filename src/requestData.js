import {
  fetchToSuccessOrFailData,
  requestActivities as _requestActivities,
  requestData as _requestData,
  selectRequestByConfig,
} from 'fetch-normalize-data'

const _request = requestMethod => config => (
  dispatch,
  getState,
  defaultConfig
) => {
  const state = getState()
  const reducer = [state.data, dispatch]

  const action = requestMethod(config)
  const fetchConfig = { ...defaultConfig, ...action.config }

  const { requestOnlyOnce } = config || {}
  if (requestOnlyOnce) {
    const { isSuccess } = selectRequestByConfig(state, config) || {}
    if (isSuccess) return
  }

  dispatch(action)

  return fetchToSuccessOrFailData(reducer, fetchConfig)
}

export const requestActivities = _request(_requestActivities)
export const requestData = _request(_requestData)

export default requestData
