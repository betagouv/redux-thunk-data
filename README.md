<img alt="redux-thunk-data logo" src="https://raw.githubusercontent.com/betagouv/redux-thunk-data/master/icon.png" height=60/>

A lib for fetching normalized data in a redux store through thunks.

See this [post](https://medium.com/pass-culture/2-an-open-source-app-94d9de8d6eee) for a presentation based on the pass culture project.

[![CircleCI](https://circleci.com/gh/betagouv/redux-thunk-data/tree/master.svg?style=svg)](https://circleci.com/gh/betagouv/redux-thunk-data/tree/master)
[![npm version](https://img.shields.io/npm/v/redux-thunk-data.svg?style=flat-square)](https://npmjs.org/package/redux-thunk-data)

## Basic Usage

You need to install a redux-thunk setup with the dataReducer from `fetch-normalize-data`:

```javascript
import {
  applyMiddleware,
  combineReducers,
  createStore
} from 'redux'
import thunk from 'redux-thunk'
import { createDataReducer } from 'redux-thunk-data'

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
import { requestData } from 'redux-thunk-data'

class Foos extends Component {
  constructor () {
    super()
    this.state = { error: null }
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(requestData({
      apiPath: '/foos',
      handleFail: (state, action) =>
        this.setState({ error: action.error })
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
  dispatch(requestData({
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
