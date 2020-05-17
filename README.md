<img alt="redux-thunk-data logo" src="https://raw.githubusercontent.com/betagouv/redux-thunk-data/master/icon.png" height=60/>

A lib for fetching normalized data in a redux store through thunks.

Inspiration was taken from redux [advices](https://redux.js.org/advanced/async-actions) with async actions. A list of other frameworks like this could be found [here](https://twitter.com/acemarke/status/1226721204725309442). Also, see this [post](https://medium.com/pass-culture/2-an-open-source-app-94d9de8d6eee) for a presentation based on the pass culture project.

[![CircleCI](https://circleci.com/gh/betagouv/redux-thunk-data/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/redux-thunk-data/tree/master)
[![npm version](https://img.shields.io/npm/v/redux-thunk-data.svg?style=flat-square)](https://npmjs.org/package/redux-thunk-data)

## Basic Usage

You need to install a redux-thunk setup with the dataReducer from `fetch-normalize-data`.
You can also use the requestsReducer to have a status state of the request :

```javascript
import {
  applyMiddleware,
  combineReducers,
  createStore
} from 'redux'
import thunk from 'redux-thunk'
import { createDataReducer, createRequestsReducer } from 'redux-thunk-data'

const storeEnhancer = applyMiddleware(
  thunk.withExtraArgument({ rootUrl: "https://momarx.com" })
)
const rootReducer = combineReducers({
  data: createDataReducer({ foos: [] }),
  requests: createRequestsReducer()
})
const store = createStore(rootReducer, storeEnhancer)
```

Then you can request data from your api that will be stored
in the state.data

### react old school

```javascript
import React, { PureComponent } from 'react'
import { requestData } from 'redux-thunk-data'


class Foos extends PureComponent {
  constructor () {
    super()
    this.state = { error: null }
  }

  handleFooClick = foo => () => {
    const { dispatch } = this.props
    dispatch(requestData({
      apiPath: '/foos',
      body: {
        isOkay: !foo.isOkay
      },
      method: 'PUT'
      handleFail: (state, action) =>
        this.setState({ error: action.payload.error })
    }))
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(requestData({
      apiPath: '/foos',
      handleFail: (state, action) =>
        this.setState({ error: action.payload.error })
    }))
  }

  render () {
    const { foos, isFoosPending } = this.props
    const { error } = this.state

    if (isFoosPending) {
      return 'Loading foos...'
    }

    if (error) {
      return error
    }

    return (
      <>
        {(foos || []).map(foo => (
          <button
            key={foo.id}
            onClick={this.handleFooClick(foo)}
            type="button"
          >
            {foo.isOkay}
          </button>
        ))}
      </>
    )
  }
}

const mapStateToProps = state => ({
  foos: state.data.foos,
  isFoosPending: (state.requests.foos || {}).isPending
})
export default connect(mapStateToProps)(Foos)
```

NOTE: We could also used a handleSuccess in the requestData api, in order to grab the action.data foos. In that case, code to be modified is:

```javascript
constructor () {
  this.state = { error: null, foos: [] }
}

handleFooClick = foo => () => {
  const { dispatch } = this.props
  dispatch(requestData({
    apiPath: '/foos',
    body: {
      isOkay: !foo.isOkay
    },
    method: 'PUT'
    handleFail: (state, action) =>
      this.setState({ error: action.error })
    handleSuccess: (state, action) => {
      const { foos } = this.props
      const nextFoos = foos.map(foo => {
        if (foo.id === action.payload.datum.id) {
          return {...foo, action.payload.datum }
        }
        return foo
      })
      this.setState({ foos: nextFoos })
    },
  }))
}

componentDidMount () {
  const { dispatch } = this.props
  dispatch(requestData({
    apiPath: '/foos',
    handleFail: (state, action) => this.setState({ error: action.payload.error }),
    handleSuccess: (state, action) => this.setState({ foos: action.payload.data }),
    method:'GET'
  }))
}

render () {
  const { error, foos } = this.state
  ...
}
```

But if your rendered foos array should be coming from a memoizing merging (and potentially normalized) (and potentially selected from inter data filter conditions) state of foos, then syntax goes easier if you pick from the connected redux store lake of data.



### react hooks school

```javascript
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { requestData } from 'redux-thunk-data'

const Foos = () => {
  const dispatch = useDispatch()

  const [error, setError] = useState(null)


  const foos = useSelector(state =>
    state.data.foos)

  const { isPending: isFoosPending } = useSelector(state =>
    state.requests.foos) || {}


  const handleFooClick = foo => () =>
    dispatch(requestData({
      apiPath: '/foos',
      body: { isOkay: !foo.isOkay },
      method: 'PUT'
      handleFail: (state, action) => setError(action.payload.error)
    }))


  useEffect(() =>
    dispatch(requestData({
      apiPath: '/foos',
      handleFail: (state, action) => setError(action.payload.error)
    })), [dispatch])


  if (isFoosPending) {
    return 'Loading foos...'
  }

  if (error) {
    return error
  }

  return (
    <>
      {(foos || []).map(foo => (
        <button
          key={foo.id}
          onClick={handleFooClick(foo)}
          type="button"
        >
          {foo.isOkay}
        </button>
      ))}
    </>
  )
}
```
