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

//ゲームのステータスを一元管理する
const GameStatus = Object.freeze({//オブジェクトを凍結させる（プロパティの追加などが行えなくなる）
    init: 'init',
    playing: 'playing',
    suspended: 'suspended',
    gameover: 'gameover',
});

let timer;//タイマーを繰り返し、セット・削除する必要があるためletで宣言

const unsubscribe = () => {//コンポーネントが削除される時に実行する関数
    if (!timer) {
        return;
    }
    clearInterval(timer)

}
//unsubscribe=解除、削除

//衝突したときを判断する条件（x,yの値がマイナスの値で、フィールドサイズより小さい座標に収まっていない場合）
const isCollision = ({ fieldSize, position }) => {
    //x.y座標のどちらかが0より小さいか＝（フィールドをはみ出している）をチェック
    if ((position.y < 0) || (position.x < 0)) {
        return true;
    }
    //x,y座標がフィールドより大きくなってしまった場合をチェック（fieldSize -1 は座標データが0始まりのため）
    if ((position.y > fieldSize - 1) || (position.x > fieldSize - 1)) {
        return true;
    }

    return false;
};

const App = () => {
    const [fields, setFields] = useState(initialValues)
    const [position, setPosition] = useState()
    const [status, setStatus] = useState(GameStatus.init)//スタータスは文字列で管理するため初期値initを登録する
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
        //ゲームがプレイ中でない限りスネークが動かないようにする
        if (!position || status !== GameStatus.playing) {
            return
        }

        //goUp関数をスネークが移動した後にゲームを続けられる状態か返すように変更
        //続けることができない時にゲームオーバーの処理をかける
        const canCoutinue = goUp()
        if (!canCoutinue) {
            setStatus(GameStatus.gameover)
        }
    }, [tick])

    const onStart = () => setStatus(GameStatus.playing)

    const onRestart = () => {
        timer = setInterval(() => {
            setTick(tick => tick + 1)
        }, defaultInterval);
        setStatus(GameStatus.init)
        setPosition(initialPosition)
        setFields(initFields(35, initialPosition))

    }

    const goUp = () => {
        //フィールドの新しい座標を取得
        const { x, y } = position

        //常に壁にぶつかったかどうかを確認する
        //新しいポジションがフィールド外であることがわかった場合、ステート
        //の更新せず、falseを返す
        const newPostion = { x, y: y - 1 }
        if (isCollision(fields.length, newPostion)) {
            unsubscribe()
            return false
        }
        //スネークの元いた位置を空にする
        fields[y][x] = ""
        fields[newPostion.y][x] = "snake"
        setPosition(fields)
        //fieldを更新する
        setFields(fields)
        return true;
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
                <Button onStart={onStart} status={status} onRestart={onRestart} />
                <ManipulationPanel />
            </footer>
        </div >
    )
}


export default App;