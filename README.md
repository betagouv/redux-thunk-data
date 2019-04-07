# redux-thunk-data

A lib for fetching normalized data in a redux store through thunks.

See the full [documentation](https://redux-thunk-data.netlify.com) for further complex use cases with several collections of data.

[![CircleCI](https://circleci.com/gh/betagouv/redux-thunk-data/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/redux-thunk-data/tree/master)
[![npm version](https://img.shields.io/npm/v/redux-thunk-data.svg?style=flat-square)](https://npmjs.org/package/redux-thunk-data)

## Basic Usage

You need to install a redux-thunk setup:

```javascript
import {
  applyMiddleware,
  combineReducers,
  createStore
} from 'redux'
import { thunk } from 'redux-thunk'

const storeEnhancer = applyMiddleware(
  thunk.withExtraArgument({ rootUrl: "https://momarx.com" })
)
const rootReducer = combineReducers({ data: createDataReducer({ foos: [] }) })
const store = createStore(rootReducer, storeEnhancer)
```

Then you can request data from your api that will be stored
in the state.data

```javascript
import React, { Fragment } from 'react'
import { requestDataAsync } from 'redux-thunk-saga'

class Foos extends Component {
  constructor () {
    super()
    this.state = { error: null }
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(requestDataAsync({
      apiPath: '/foos',
      handleFail: () => this.setState({ error: action.error }),
      method:'GET'
    }))
  }

  render () {
    const { foos } = this.props
    const { error } = this.state

    if (error) {
      return error
    }

    return (
      <Fragment>
        {foos.map(foo => (
          <div key={foo.id}> {foo.text} </div>
        ))}
      </Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    foos: state.data.foos
  }
}
export default connect(mapStateToProps)(Foo)
```

NOTE: We could also used a handleSuccess in the requestData api, in order to grab the action.data foos in that simple case:

```javascript
constructor () {
  this.state = { error: null, foos: [] }
}

componentDidMount () {
  const { dispatch } = this.props
  dispatch(requestDataAsync({
    apiPath: '/foos',
    handleFail: () => this.setState({ error: action.error }),
    handleSuccess: () => this.setState({ foos: action.data }),
    method:'GET'
  }))
}

render () {
  const { error, foos } = this.setState
  ...
}
```

But if your rendered foos array should be coming from a memoizing merging (and potentially normalized) (and potentially selected from inter data filter conditions) state of foos, then syntax goes easier if you pick from the connected redux store lake of data.
