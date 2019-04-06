/* eslint-disable no-use-before-define */
import 'babel-polyfill'
import { mount } from 'enzyme'
import { createDataReducer } from 'fetch-normalize-data'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect, Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'

import { requestDataAsync } from '../requestDataAsync'

const mockFoos = [
  { id: "AE", text: "My foo is here", type: "good" },
  { id: "BF", test: "My other foo also", type: "bad" }
]

const storeEnhancer = applyMiddleware(
  thunk.withExtraArgument({ rootUrl: "https://momarx.com" })
)
const rootReducer = combineReducers({ data: createDataReducer({ foos: [] }) })

class Foos extends Component {
  componentDidMount () {
    const { apiPath, dispatch, handleFailExpectation } = this.props
    dispatch(requestDataAsync({
      apiPath,
      handleFail: handleFailExpectation,
      stateKey: 'foos'
    }))
  }

  render () {
    const { foos, handleSuccessExpectation } = this.props

    if (foos && foos.length) {
      handleSuccessExpectation(foos)
    }

    return (
      <Fragment>
        {(foos || []).map(foo => (
          <div key={foo.id}>
            {foo.text}
          </div>
        ))}
      </Fragment>
    )
  }
}
Foos.defaultProps = {
  foos: null,
  handleFailExpectation: () => ({}),
  handleSuccessExpectation: () => ({})
}
Foos.propTypes = {
  apiPath: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  foos: PropTypes.arrayOf(PropTypes.shape()),
  handleFailExpectation: PropTypes.func,
  handleSuccessExpectation: PropTypes.func
}
function mapStateToProps(state, ownProps) {
  return {
    foos: (state.data.foos || []).filter(foo => foo.type === ownProps.type)
  }
}
const FoosContainer = connect(mapStateToProps)(Foos)

jest.mock('fetch-normalize-data', () => {
  const actualModule = jest.requireActual('fetch-normalize-data')
  return {
    ...actualModule,
    fetchData: async (url, config) => {
      await setTimeout()
      if (url === 'https://momarx.com/failFoos') {
        return {
          payload: { errors: [] },
          status: 400
        }
      }
      if (url === 'https://momarx.com/successFoos') {
        return {
          payload: { data: mockFoos },
          status: 200
        }
      }
      return actualModule.fetchData(url, config)
    }
  }
})

describe('redux-thunk-data with Foos basic usage', () => {
  describe('request with success', () => {
    it('should render test component whith foo items', done => {
      // given
      const store = createStore(rootReducer, storeEnhancer)

      // when
      mount(
        <Provider store={store}>
          <FoosContainer
            apiPath='/successFoos'
            handleSuccessExpectation={handleSuccessExpectation}
            type="good"
          />
        </Provider>
      )

      // then
      function handleSuccessExpectation(foos) {
        expect(foos).toHaveLength(1)
        expect(foos[0]).toEqual(mockFoos[0])
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
            apiPath='/failFoos'
            handleFailExpectation={handleFailExpectation}
          />
        </Provider>
      )

      // then
      function handleFailExpectation() {
        done()
      }
    })
  })
})
