import { useState, useEffect, useCallback } from 'react';
import {
    defaultInterval,
    defaultDifficulty,
    Delta,
    Difficulty,
    Direction,
    DirectionKeyCodeMap,
    GameStatus,
    oppositeDirection,
    initialPosition,
    initialValues
} from "../constants";

import {
    initFields,
    isCollision,
    isEatingMyself,
    getFoodPosition,
} from "../utils"

let timer = null;//タイマーを繰り返し、セット・削除する必要があるためletで宣言

const unsubscribe = () => {//コンポーネントが削除される時に実行する関数
    if (!timer) {
        return;
    }
    clearInterval(timer)
};
//unsubscribe=解除、削除


const useSnakeGame = () => {
    const [fields, setFields] = useState(initialValues);
    // const [position, setPosition] = useState()
    const [body, setBody] = useState([]);
    const [status, setStatus] = useState(GameStatus.init);//スタータスは文字列で管理するため初期値initを登録する
    const [direction, setDirection] = useState(Direction.up);
    const [difficulty, setDifficulty] = useState(defaultDifficulty);
    const [tick, setTick] = useState(0);



    useEffect(() => {//初回レンダリング時だけ初期化を実施する（useEffect)を使用する
        setBody([initialPosition]);

        //ゲームの中の時間を管理する
        const interval = Difficulty[difficulty - 1];
        timer = setInterval(() => {
            setTick(tick => tick + 1)
        }, interval);
        return unsubscribe;
    }, [difficulty]);//コンポーネントが削除される際にタイマーも削除される

    useEffect(() => {
        //ゲームがプレイ中でない限りスネークが動かないようにする
        if (body.length === 0 || status !== GameStatus.playing) {
            return;//関数の実行を終了する、
        }
        //goUp関数をスネークが移動した後にゲームを続けられる状態か返すように変更
        //続けることができない時にゲームオーバーの処理をかける
        const canCoutinue = handleMoving();
        if (!canCoutinue) {
            unsubscribe();
            setStatus(GameStatus.gameover)
        }
    }, [tick])

    const start = () => setStatus(GameStatus.playing)

    const stop = () => setStatus(GameStatus.suspended)

    const reload = () => {
        timer = setInterval(() => {
            setTick(tick => tick + 1);
        }, defaultInterval);
        setStatus(GameStatus.init);
        setBody([initialPosition]);
        setDirection(Direction.up);
        setFields(initFields(fields.length, initialPosition));
    };

    //操作パネルで方向を変える
    const updateDirection = useCallback(
        (newDirection) => {
            if (status !== GameStatus.playing) {
                return;
            }
            if (oppositeDirection[direction] === newDirection) {
                return;
            }
            setDirection(newDirection);
        },
        [direction, status]
    );


    const updateDifficulty = useCallback(
        (difficulty) => {
            if (status !== GameStatus.init) {//ゲームを始める前以外は変更できない
                return;
            }
            if (difficulty < 1 || difficulty > Difficulty.length) {
                return;
            }
            setDifficulty(difficulty)
        }, [status]
    );

    //usecallback 配列で渡してあげた状態が変わらない限り、関数が再生成されないようにする


    useEffect(() => {
        const handleKeyDown = (e) => {
            const newDirection = DirectionKeyCodeMap[e.keyCode];//e.keyDode押したキーコードを取得
            if (!newDirection) {
                return;
            }
            updateDirection(newDirection);
        };
        document.addEventListener("keydown", handleKeyDown);//任意のキーを押したとき、handleKeyDown関数を実行
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [updateDirection]);

    const handleMoving = () => {
        //フィールドの新しい座標を取得
        const { x, y } = body[0];

        //常に壁にぶつかったかどうかを確認する
        //新しいポジションがフィールド外であることがわかった場合、ステート
        //の更新せず、falseを返す
        const delta = Delta[direction];//今の方向による座標の変化量を取得
        const newPosition = {
            x: x + delta.x,
            y: y + delta.y,
        };
        if (isCollision(fields.length, newPosition) ||
            isEatingMyself(fields, newPosition)
        ) {
            return false;
        }

        //スネークの元いた位置を空にする
        const newBody = [...body];
        if (fields[newPosition.y][newPosition.x] !== "food") {//スネークが餌を食べない場合
            const removingTrack = newBody.pop();//bodyの末尾のポジションを抜き出す
            fields[removingTrack.y][removingTrack.x] = "";//そのポジションを空文字でリセットする
        } else {//スネークが餌を食べた場合、餌を再度出現させる
            const food = getFoodPosition(fields.length, [newBody, newPosition]);
            fields[food.y][food.x] = "food";
        }
        fields[newPosition.y][newPosition.x] = "snake";
        newBody.unshift(newPosition);

        setBody(newBody);
        //fieldを更新する
        setFields(fields);
        return true;
    };
    return {
        body,
        difficulty,
        fields,
        status,
        start,
        stop,
        reload,
        updateDirection,
        updateDifficulty
    };
};

export default useSnakeGame;