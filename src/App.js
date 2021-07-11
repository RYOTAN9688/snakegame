import React, { useState, useEffect, useCallback } from 'react';

import Navigation from './component/Navigation';
import Field from './component/Field';
import Button from './component/Button';
import ManipulationPanel from './component/ManipulationPanel';
import "./index.css"
import { initFields, getFoodPosition } from './utils';


const initialPosition = { x: 17, y: 17 }
const initialValues = initFields(35, initialPosition)
const defaultInterval = 100
const defaultDifficulty = 3

const Difficulty = [1000, 500, 100, 50, 10]
//ゲームのステータスを一元管理する
const GameStatus = Object.freeze({//オブジェクトを凍結させる（プロパティの追加などが行えなくなる）
    init: 'init',
    playing: 'playing',
    suspended: 'suspended',
    gameover: 'gameover',
});

const Direction = Object.freeze({
    up: "up",
    right: "right",
    left: "left",
    down: "down",

})
const DirectionKeyCodeMap = Object.freeze({
    37: Direction.left,
    38: Direction.up,
    39: Direction.right,
    40: Direction.down,
})

const oppositeDirection = Object.freeze({
    up: "down",
    right: "left",
    left: "right",
    down: "up",
})

const Delta = Object.freeze({
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    left: { x: -1, y: 0 },
    down: { x: 0, y: 1 },
})

let timer = undefined;//タイマーを繰り返し、セット・削除する必要があるためletで宣言

const unsubscribe = () => {//コンポーネントが削除される時に実行する関数
    if (!timer) {
        return;
    }
    clearInterval(timer)

}
//unsubscribe=解除、削除

//衝突したときを判断する条件（x,yの値がマイナスの値で、フィールドサイズより小さい座標に収まっていない場合）
const isCollision = (fieldSize, position) => {
    //x.y座標のどちらかが0より小さいか＝（フィールドをはみ出している）をチェック
    if (position.y < 0 || position.x < 0) {
        return true;
    }
    //x,y座標がフィールドより大きくなってしまった場合をチェック（fieldSize -1 は座標データが0始まりのため）
    if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
        return true;
    }
    return false;

};

const isEatingMyself = (fields, position) => {//自分を食べてしまった場合の処理
    return fields[position.y][position.x] === "snake"
}


const App = () => {
    const [fields, setFields] = useState(initialValues)
    // const [position, setPosition] = useState()
    const [body, setBody] = useState([])
    const [status, setStatus] = useState(GameStatus.init)//スタータスは文字列で管理するため初期値initを登録する
    const [tick, setTick] = useState(0)
    const [direction, setDirection] = useState(Direction.up)
    const [difficulty, setDifficulty] = useState(defaultDifficulty)



    useEffect(() => {//初回レンダリング時だけ初期化を実施する（useEffect)を使用する
        setBody([initialPosition])
        //ゲームの中の時間を管理する
        const interval = Difficulty[difficulty - 1]
        timer = setInterval(() => {
            setTick(tick => tick + 1)
        }, interval)
        return unsubscribe
    }, [difficulty])//コンポーネントが削除される際にタイマーも削除される

    useEffect(() => {
        //ゲームがプレイ中でない限りスネークが動かないようにする
        if (body.length === 0 || status !== GameStatus.playing) {
            return;//関数の実行を終了する、
        }
        //goUp関数をスネークが移動した後にゲームを続けられる状態か返すように変更
        //続けることができない時にゲームオーバーの処理をかける
        const canCoutinue = handleMoving()
        if (!canCoutinue) {
            setStatus(GameStatus.gameover)
        }
    }, [tick])

    const onStart = () => setStatus(GameStatus.playing)

    const onStop = () => setStatus(GameStatus.suspended)

    const onRestart = () => {
        timer = setInterval(() => {
            setTick(tick => tick + 1)
        }, defaultInterval);
        setStatus(GameStatus.init)
        setBody([initialPosition])
        setDirection(Direction.up)
        setFields(initFields(35, initialPosition))

    }
    //操作パネルで方向を変える
    const onChangeDirection = useCallback((newDirection) => {
        if (status !== GameStatus.playing) {
            return direction;
        }
        if (oppositeDirection[direction] === newDirection) {
            return;
        }
        setDirection(newDirection);
    }, [direction, status]);


    const onChangeDifficulty = useCallback((difficulty) => {
        if (status !== GameStatus.init) {//ゲームを始める前以外は変更できない
            return;
        }
        if (difficulty < 1 || difficulty > Difficulty.length) {
            return;
        }
        setDifficulty(difficulty)
    }, [status, difficulty])

    //usecallback 配列で渡してあげた状態が変わらない限り、関数が再生成されないようにする


    useEffect(() => {
        const handleKeyDown = (e) => {
            const newDirection = DirectionKeyCodeMap[e.keyCode];//e.keyDode押したキーコードを取得
            if (!newDirection) {
                return;
            }
            onChangeDirection(newDirection);
        };
        document.addEventListener("keydown", handleKeyDown)//任意のキーを押したとき、handleKeyDown関数を実行
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [onChangeDirection])

    const handleMoving = () => {
        //フィールドの新しい座標を取得
        const { x, y } = body[0]

        //常に壁にぶつかったかどうかを確認する
        //新しいポジションがフィールド外であることがわかった場合、ステート
        //の更新せず、falseを返す
        const delta = Delta[direction]//今の方向による座標の変化量を取得
        const newPosition = {
            x: x + delta.x,
            y: y + delta.y,
        }
        if (isCollision(fields.length, newPosition) || isEatingMyself(fields, newPosition)) {
            unsubscribe()
            return false;
        }

        //スネークの元いた位置を空にする
        const newBody = [...body]
        if (fields[newPosition.y][newPosition.x] !== "food") {//スネークが餌を食べない場合
            const removingTrack = newBody.pop()//bodyの末尾のポジションを抜き出す
            fields[removingTrack.y][removingTrack.x] = "" //そのポジションを空文字でリセットする
        } else {//スネークが餌を食べた場合、餌を再度出現させる
            const food = getFoodPosition(fields.length, [newBody, newPosition])
            fields[food.y][food.x] = "food"
        }


        fields[newPosition.y][newPosition.x] = "snake"
        newBody.unshift(newPosition)
        setBody(newBody)
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
                <Navigation
                    length={body.length}
                    difficulty={difficulty}
                    onChangeDifficulty={onChangeDifficulty} />
            </header>

            <main className="main">
                <Field fields={fields} />
            </main>


            <footer className="footer">
                <Button
                    status={status}
                    onStart={onStart}
                    onStop={onStop}
                    onRestart={onRestart} />
                <ManipulationPanel onChange={onChangeDirection} />
            </footer>
        </div >
    )
}


export default App;