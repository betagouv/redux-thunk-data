import { fetchToSuccessOrFailData, requestData as requestDataCreator } from 'fetch-normalize-data'

export const requestData = config =>
  (dispatch, getState, argument) => {
    const { data } = getState()
    const reducer = [data, dispatch]
    const fetchConfig = Object.assign({}, config, argument)
    dispatch(requestDataCreator(config))
    return fetchToSuccessOrFailData(reducer, fetchConfig)
  }

export default requestData
