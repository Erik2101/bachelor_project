import React from 'react'

function Tab(props : {
    activeTab : string,
    label : string,
    onClick : Function
}) {
    
    function handleClick() {
        console.log("Tab handle Click")
        props.onClick(props.label)
    }

    let className = "tab-list-item"
    if (props.activeTab === props.label) {
        className += " tab-list-active"
    }
    return (
    <li className={className} onClick={handleClick}>
        {props.label}
    </li>
    )
}

export default Tab