import React from 'react';
import dva, {connect} from './dva';
import {Router, Switch, Route, Link, routerRedux} from './dva/router';
import {createBrowserHistory} from 'history';
//import createLoading from 'dva-loading';
//import logger from 'redux-logger';
function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

let history = createBrowserHistory();

function logger({getState, dispatch}) {
    return function (next) {
        return function (action) {
            console.log('老状态', getState());
            next(action);
            console.log('新状态', getState());
        }
    }
}

const SHOW = 'SHOW';//显示
const HIDE = 'HIDE';//隐藏
// namespace=loading
let initialLoadingState = {
    global: false,
    effects: {},
    models: {}
};
let app = dva({
    history,
    initialState: {counter: {number: 5}},
    onError: (error) => alert(error),
    onAction: [logger],//可以支持中间件
    onStateChange: state => localStorage.setItem('state', JSON.stringify(state)),
    onReducer: reducer => (state, action) => {//它其实是对reducer的封装或改进
        console.log('准备要执行reducer了!');
        return reducer(state, action);
    },
    extraEnhancers: [StoreCreator => {
        return StoreCreator;
    }]
});

function createLoading() {
    return {
        onEffect: (effect, {put}, model, actionType) => {
            const {namespace} = model;
            return function* (...args) {
                yield put({type: SHOW, payload: {namespace, actionType}});
                yield effect(...args);
                yield put({type: HIDE, payload: {namespace, actionType}});
            }
        },
        extraReducers: {
            //global:false,effects:{},models:{}
            loading(state = initialLoadingState, {type, payload}) {
                const {namespace, actionType} = payload || {};
                switch (type) {
                    case SHOW:
                        return {
                            global: true,
                            models: {...state.models, [namespace]: true},
                            effects: {...state.effects, [actionType]: true}
                        };
                    case HIDE:
                        let effects = {...state.effects, [actionType]: false};
                        let modelStatus = Object.keys(effects).filter(item => item.startsWith(namespace + '/')).some(item => effects[item]);
                        let models = {...state.models, [namespace]: modelStatus};
                        let global = Object.keys(models).some(namespace => models[namespace]);
                        return {global, models, effects};
                    default:
                        return state;
                }
            }
        }
    }
}

app.use(createLoading());
app.model({
    namespace: 'counter',
    state: {number: 0},
    reducers: {
        add(state, action) {
            return {number: state.number + (action.payload || 1)};
        }
    },
    effects: {
        * asyncAdd(action, {call, put}) {
            yield call(delay, 1000);
            yield put({type: 'add'});
            //throw new Error('asyncAddError');
        },
        * goto({payload: {pathname}}, {call, put}) {
            yield put(routerRedux.push(pathname));//connected-react-router
        }
    },
    subscriptions: {
        setup() {
            console.log('start subscriptions')
        }
    }
});

const Home = () => <div>首页内容</div>;

const Counter = connect(state => state.counter)(
    props => (
        <>
            <p>{props.number}</p>
            <button onClick={() => props.dispatch({type: 'counter/add', payload: 2})}>+</button>
            <button onClick={() => props.dispatch({type: 'counter/asyncAdd'})}>异步加1</button>
            <button onClick={() => props.dispatch({type: 'counter/goto', payload: {pathname: '/'}})}>跳转到首页</button>
        </>
    )
);

app.router(({history}) => (
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
));
app.start('#root');

window.getState = app._store.getState;