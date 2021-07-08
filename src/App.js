import React, { useState, useEffect } from 'react';

import Navigation from './component/Navigation';
import Field from './component/Field';
import Button from './component/Button';
import ManipulationPanel from './component/ManipulationPanel';
import "./index.css"
import { initFields } from './utils';


const initialPosition = { x: 17, y: 17 }
const initialValues = initFields(35, initialPosition)
const defaultInterval = 100

let timer;//タイマーを繰り返し、セット・削除する必要があるためletで宣言

const unsubscribe = () => {//コンポーネントが削除される時に実行する関数
    if (!timer) {
        return;
    }
    clearInterval(timer)

}

//unsubscribe=解除、削除


const App = () => {
    const [fields, setFields] = useState(initialValues)
    const [position, setPosition] = useState()
    const [status, setStatus] = useState('init')//スタータスは文字列で管理するため初期値initを登録する
    const [tick, setTick] = useState(0)

    useEffect(() => {//初回レンダリング時だけ初期化を実施する（useEffect)を使用する
        setPosition(initialPosition)
        //ゲームの中の時間を管理する
        timer = setInterval(() => {
            // if (!position) {//positionのnullチェックを行う(potisionは未設定時はundefinedのため)
            //     return
            // }
            // goUp()
            setTick(tick => tick + 1)
        }, defaultInterval)
        return unsubscribe
    }, [])//コンポーネントが削除される際にタイマーも削除される

    useEffect(() => {
        if (!position) {
            return
        }
        goUp()
    }, [tick])

    const goUp = () => {
        const { x, y } = position//フィールドの新しい座標を取得
        const nextY = Math.max(y - 1, 0)//スネークのy座標をデクリメント（1ずつ減算）する
        fields[y][x] = ""//スネークの元いた位置を空にする
        fields[nextY][x] = 'snake'//fieldsの次にいる場所をSnakeに変更
        setPosition({ x, y: nextY })//setPositionでスネークの位置を更新(xはそのまま、yはnextYの値になる)
        setFields(fields)//fieldを更新する
    }

    //GoUpでは元の変数の値を書き換えている（破壊的変更）がsetPotisionで
    //レンダリングをトリガ―（何かをやるきっかけ）できるため破壊的変更を許容している

    return (
        <div className="App">
            <header className="header">
                <div className="title-container">
                    <h1 className="title">Snake Game</h1>
                </div>
                <Navigation />
            </header>

            <main className="main">
                <Field fields={fields} />
            </main>


            <footer className="footer">
                <Button />
                <ManipulationPanel />
            </footer>
        </div >
    )
}


export default App;