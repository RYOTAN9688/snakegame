import React from 'react';
import Field from '../component/Field';

export const getFoodPosition = (fieldSize, excludes) => {
    while (true) {
        const x = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1;
        const y = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1;
        const conflict = excludes.some(item => item.x === x && item.y === y)
        //callbackでsnakeの配列が渡され、ランダムに取得された座標が排除リストにあるかをチェックする
        if (!conflict) {
            return { x, y };
        }
    }
}



export const initFields = (fieldSize, snake) => {

    const fields = []
    for (let i = 0; i < fieldSize; i++) {
        const cols = new Array(fieldSize).fill("")
        fields.push(cols)
    }
    fields[snake.y][snake.x] = 'snake'

    const food = getFoodPosition(fieldSize, [snake])
    fields[food.y][food.x] = "food"

    return fields
}


//衝突したときを判断する条件（x,yの値がマイナスの値で、フィールドサイズより小さい座標に収まっていない場合）
export const isCollision = (fieldSize, position) => {
    //x.y座標のどちらかが0より小さいか＝（フィールドをはみ出している）をチェック
    //x,yどちらかの座標がマイナスの値の時
    if (position.y < 0 || position.x < 0) {
        return true;
    }
    //x,yのどちらかの座標がフィールドサイズを超えてしまっているとき
    if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
        return true;
    }
    return false;
};
//自分を食べてしまった場合の処理
export const isEatingMyself = (fields, position) => {
    return fields[position.y][position.x] === "snake"
}