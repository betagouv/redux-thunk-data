import { fetchToSuccessOrFailData, requestData } from 'fetch-normalize-data'

export const requestDataAsync = config =>
  (dispatch, getState, argument) => {
    const { data } = getState()
    const reducer = [data, dispatch]
    const fetchConfig = Object.assign({}, config, argument)
    dispatch(requestData(config))
    return fetchToSuccessOrFailData(reducer, fetchConfig)
  }

export default requestDataAsync
