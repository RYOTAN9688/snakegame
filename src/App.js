import React from 'react';
import Navigation from './component/Navigation';
import Field from './component/Field';
import Button from './component/Button';
import ManipulationPanel from './component/ManipulationPanel';
import "./index.css"
import useSnakeGame from './hooks/useSnakeGame';

const App = () => {

    const {
        body,
        difficulty,
        fields,
        status,
        start,
        stop,
        reload,
        updateDirection,
        updateDifficulty
    } = useSnakeGame();

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
                    onChangeDifficulty={updateDifficulty}
                />
            </header>

            <main className="main">
                <Field fields={fields} />
            </main>


            <footer className="footer">
                <Button
                    status={status}
                    onStart={start}
                    onStop={stop}
                    onRestart={reload} />
                <ManipulationPanel onChange={updateDirection} />
            </footer>
        </div >
    )
}


export default App;