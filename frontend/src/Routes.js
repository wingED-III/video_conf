import React from 'react'
import history from "./history";
import Room from './Room';
function Routes() {
    return (
        <Router history={history}>
      <Switch> 
<AuthRoute path="/room" exact component={Room} />
      </Switch>
    </Router>
    )
}

export default Routes
