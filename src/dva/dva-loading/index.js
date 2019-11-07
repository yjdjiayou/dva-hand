const SHOW = 'SHOW';//显示
const HIDE = 'HIDE';//隐藏
// namespace = loading
let initialLoadingState = {
    global: false,
    effects: {},
    models: {}
};

export function createLoading() {
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
            // {global:false,effects:{},models:{}}
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