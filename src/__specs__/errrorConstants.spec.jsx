import * as reduxThunkApi from '../index'

jest.mock('fetch-normalize-data', () => {
  return {
    API_ERROR: 'API_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
  }
})

describe('redux-thunk-data | Exports constants', () => {
  it('should ', () => {
    expect(reduxThunkApi.API_ERROR).toBeDefined()
    expect(reduxThunkApi.SERVER_ERROR).toBeDefined()
  })
})
