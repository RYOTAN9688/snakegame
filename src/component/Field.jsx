import React from "react";

const Field = ({ fields }) => {
    return (
        <div className="field">
            {
                fields.map((row) => {
                    return row.map((column) => {
                        return <div className={`dots ${column}`}></div>
                    })
                })
                //fill関数:全ての配列の中身を引数に与えられた値（”"空文字）で初期化できる
            }
        </div>
    );
};

export default Field;
