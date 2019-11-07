import React from 'react';
import  {connect} from '../dva';

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

export default  Counter;