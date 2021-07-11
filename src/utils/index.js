import React from 'react';

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