import {routerRedux} from "../dva/router";
import {delay} from "../utils/delay";

export default {
    namespace: 'counter',
    state: {number: 0},
    reducers: {
        add(state, action) {
            return {number: state.number + (action.payload || 1)};
        }
    },
    // 用于处理异步操作和业务逻辑
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
    // 只在 app.start() 时执行一次
    subscriptions: {
        // 这里的 key 可以任意命名
        setup({history, dispatch}) {
            console.log('start subscriptions =>',{history, dispatch});
        }
    }
}