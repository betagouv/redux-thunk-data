import {
  fetchData,
  getConfigWithDefaultValues,
  getUrlFromConfig,
  isSuccessStatus
} from 'fetch-normalize-data'

import { handleApiError } from './handleApiError'
import { handleApiSuccess } from './handleApiSuccess'
import { handleResultError } from './handleResultError'
import { handleServerError } from './handleServerError'

export async function fetchToSuccessOrFailData(
  reducer,
  configWithoutDefaultValues
) {
  const config = getConfigWithDefaultValues(configWithoutDefaultValues)

  const url = getUrlFromConfig(config)

  const fetchDataMethod = config.fetchData || fetchData

  try {

    const fetchResult = await fetchDataMethod(url, config)

    if (!fetchResult) {
      handleResultError(reducer, config)
    }

    const { ok, payload, status } = fetchResult
    Object.assign(config, { ok, status })

    const isSuccess = isSuccessStatus(status)

    if (isSuccess) {
      handleApiSuccess(reducer, payload, config)
      return
    }

    if (payload.errors) {
      handleApiError(reducer, payload, config)
    }

  } catch (error) {
    handleServerError(reducer, error, config)
  }
}

export default fetchToSuccessOrFailData
