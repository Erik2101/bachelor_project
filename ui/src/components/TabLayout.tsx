import React, { ReactElement } from 'react'
import Tab from './Tab'

function TabLayout(props : {
    children : Array<ReactElement>
}) {    
    const [activeTab, setActiveTab] = React.useState<string>(props.children[0].props.id)

    function handleClick(event : string) {
        setActiveTab(event)
    }

    return (
        <div className="tab-layout">
            <ol className="tab-list">
                {props.children.map((child) => {
                    const id = child.props.id
                    return (
                        <Tab 
                            activeTab = {activeTab}
                            key = {id}
                            label = {id}
                            onClick = {handleClick}
                        />
                    )
                })

                }
            </ol>
            <hr className="tab-layout-spacer"></hr>
            <div className="tab-content">
                {props.children.map((child) => {
                    if (child.props.id !== activeTab) return undefined
                    return child.props.children
                })}
            </div>
        </div>
    )
}

export default TabLayout