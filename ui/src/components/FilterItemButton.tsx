import React from "react";

function FilterItemButton(props: {onClick : Function, className : string, option : string}) {

    function handleClick(event : React.PointerEvent<HTMLDivElement>) {
        const target = event.currentTarget
        const item_to_remove = target.parentElement?.firstChild?.textContent
        props.onClick(item_to_remove, props.option)
    }

    return (
        <div className={props.className} onClick={handleClick}>
            X
        </div>
    )
}

export default FilterItemButton