import React from "react";
import "./Header.css";

const Header = () => {
    return (
        <header className="main-app-header">
            <div className="logo">
            <h1 id="app-title">SDC Control Station Med</h1>
            </div>
            <div className="tab-container">
                <h1 id="Bericht">Item 1</h1>
                <h1 id="Tickets">Item 2</h1>
                <h1 id="Tickets">Item 3</h1>
                <h1 id="Tickets">Item 4</h1>
            </div>
        </header>
    )
}

export default Header