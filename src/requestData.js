import { fetchToSuccessOrFailData, requestData as _requestData } from 'fetch-normalize-data'

export const requestData = config =>
  (dispatch, getState, argument) => {
    const { data } = getState()
    const reducer = [data, dispatch]
    const fetchConfig = Object.assign({}, config, argument)
    dispatch(_requestData(config))
    return fetchToSuccessOrFailData(reducer, fetchConfig)
  }

export default requestData