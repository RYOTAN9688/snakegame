import React from "react";

const Field = () => {
    return (
        <div className="field">
            <p>field</p>
            {
                new Array(35 * 35).fill("").map(() => <div className="dots"></div>)//fill関数:全ての配列の中身を引数に与えられた値（”"空文字）で初期化できる
            }
        </div>
    );
};

export default Field;
