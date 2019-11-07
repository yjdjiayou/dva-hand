import React from 'react';
import Home from "./routes/Home";
// import Counter from "./routes/Counter";
import {Router, Switch, Route, Link} from './dva/router';
import {dynamic} from "./dva/dynamic";

 function RouterConfig({ history,app }) {
     const Counter = dynamic({
         app,
         models:()=>[import('./models/counter')],
         component: () => import('./routes/Counter')
     });
    return (
        <Router history={history}>
            <>
                <Link to="/">首页</Link>
                <br/>
                <Link to="/counter">计数器</Link>
                <Switch>
                    <Route path="/" exact component={Home}/>
                    <Route path="/counter" component={Counter}/>
                </Switch>
            </>
        </Router>
    );
}

export default RouterConfig;