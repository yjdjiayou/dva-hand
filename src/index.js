import React from 'react';
import dva from './dva';
import {createBrowserHistory} from 'history';
import {createLoading} from "./dva/dva-loading";
//import createLoading from 'dva-loading';
import logger from 'redux-logger';

const history = createBrowserHistory();

let app = dva({
    history,
    initialState: {counter: {number: 5}},
    onError: (error) => alert(error),
    onAction: [logger],// 这里放置中间件
    onStateChange: state => localStorage.setItem('state', JSON.stringify(state)),
    onReducer: reducer => (state, action) => {
        // console.log('准备要执行 reducer 了!');
        return reducer(state, action);
    },
    extraEnhancers: [StoreCreator => {
        return StoreCreator;
    }],
});

// 注册插件
app.use(createLoading());

// 加载数据模型
app.model(require('./models/counter').default);

// 配置路由
app.router(require('./router').default);

app.start('#root');

// window.getState = app._store.getState;