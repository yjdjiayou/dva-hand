import React from 'react';
import {valueTypeUtil} from "../../utils/type";

export function dynamic({app, models, component}) {
    return class extends React.Component {
        state = {Component: null};

        getComponent(component) {
            return component().then(result => {
                let Component = result.default || result;
                console.log(Component);
                // 返回一个函数组件，而不是直接返回 JSX
                // 这里接收的 props 是路由信息
                return props => <Component {...props} app={app}/>;
            });
        }

        componentDidMount() {
            this.setState({Component: () => <>加载中...</>});

            if (models && component && valueTypeUtil.isFunction(models) && valueTypeUtil.isFunction(component)) {
                Promise.all([
                    Promise.all(models().map(item => item)),
                    this.getComponent(component)
                ]).then(([models, Component]) => {
                    models.forEach(model => {
                        let finded = app._models.find(item => item.namespace === model.default.namespace);
                        if (!finded) app.model(model.default || model)
                    });
                    // × Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object
                    // 如果报这种错，说明你的组件没有用 export defalut XXX 导出
                    this.setState({Component});
                })
            }
        }

        render() {
            let Component = this.state.Component;
            return Component && <Component {...this.props}/>
        }
    }
}