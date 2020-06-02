/* eslint-disable no-use-before-define */
import '@babel/polyfill'
import { mount } from 'enzyme'
import { createDataReducer } from 'fetch-normalize-data'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect, Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'

import { requestData } from '../requestData'

const mockFoos = [
  { id: 'AE', text: 'My foo is here', type: 'good' },
  { id: 'BF', test: 'My other foo also', type: 'bad' },
]

const storeEnhancer = applyMiddleware(
  thunk.withExtraArgument({ rootUrl: 'https://momarx.com' })
)
const rootReducer = combineReducers({ data: createDataReducer({ foos: [] }) })

class Foos extends Component {
  componentDidMount() {
    const { apiPath, dispatch, handleFailExpectation } = this.props
    dispatch(
      requestData({
        apiPath,
        handleFail: handleFailExpectation,
        stateKey: 'foos',
      })
    )
  }

  render() {
    const { foos, handleSuccessExpectation } = this.props

    if (foos && foos.length) {
      handleSuccessExpectation(foos)
    }

    return (
      <Fragment>
        {(foos || []).map(foo => (
          <div key={foo.id}>{foo.text}</div>
        ))}
      </Fragment>
    )
  }
}
Foos.defaultProps = {
  foos: null,
  handleFailExpectation: () => ({}),
  handleSuccessExpectation: () => ({}),
}
Foos.propTypes = {
  apiPath: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  foos: PropTypes.arrayOf(PropTypes.shape()),
  handleFailExpectation: PropTypes.func,
  handleSuccessExpectation: PropTypes.func,
}
function mapStateToProps(state, ownProps) {
  return {
    foos: (state.data.foos || []).filter(foo => foo.type === ownProps.type),
  }
}
const FoosContainer = connect(mapStateToProps)(Foos)

jest.mock('fetch-normalize-data', () => {
  const actualModule = jest.requireActual('fetch-normalize-data')
  const mockFetchData = (url, config) => {
    if (url === 'https://momarx.com/failFoos') {
      return {
        errors: [],
        status: 400,
      }
    }
    if (url === 'https://momarx.com/successFoos') {
      return {
        data: mockFoos,
        status: 200,
      }
    }
    return actualModule.fetchData(url, config)
  }
  return {
    ...actualModule,
    fetchToSuccessOrFailData: (reducer, config) =>
      actualModule.fetchToSuccessOrFailData(
        reducer,
        Object.assign({}, config, { fetchData: mockFetchData })
      ),
  }
})

describe('redux-thunk-data with Foos basic usage', () => {
  describe('request with success', () => {
    it('should render test component whith foo items', done => {
      // given
      const store = createStore(rootReducer, storeEnhancer)
      const expectedFoos = mockFoos
        .filter(mockFoo => mockFoo.type === 'good')
        .map(mockFoo => ({
          ...mockFoo,
          __ACTIVITIES__: ['/successFoos'],
        }))

      // when
      mount(
        <Provider store={store}>
          <FoosContainer
            apiPath="/successFoos"
            handleSuccessExpectation={handleSuccessExpectation}
            type="good"
          />
        </Provider>
      )

      // then
      function handleSuccessExpectation(foos) {
        expect(foos).toEqual(expectedFoos)
        done()
      }
    })
  })

  describe('request with fail', () => {
    it('should render test component whith no foo items', done => {
      // given
      const store = createStore(rootReducer, storeEnhancer)

      // when
      mount(
        <Provider store={store}>
          <FoosContainer
            apiPath="/failFoos"
            handleFailExpectation={handleFailExpectation}
          />
        </Provider>
      )

      // then
      function handleFailExpectation(state, action) {
        const { payload } = action
        const { errors } = payload
        expect(errors).toHaveLength(2)
        done()
      }
    })
  })
})
