import React from 'react';

import Navigation from './component/Navigation';
import Field from './component/Field';
import Button from './component/Button';
import ManipulationPanel from './component/ManipulationPanel';



const App = () => {
    return (
        <div className="App">
            <header className="header">
                <div className="title-container">
                    <h1 className="title">Snake Game</h1>
                </div>
                <Navigation />
            </header>
            <main className="main">
                <Field />
            </main>
            <footer className="footer">
                <Button />
                <ManipulationPanel />
            </footer>
        </div>
    )
}


export default App;