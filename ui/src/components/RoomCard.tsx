import React from "react";
import { DeviceData } from "../proto/frontend_pb";
import { getRooms, getStations, populateTable } from "../util";
import "./RoomCard.css";

function RoomCard(props: {data: Array<DeviceData>}) {

    const [deviceData, setDeviceData] = React.useState<Array<DeviceData>>()
    const [selectedStation, setSelectedStation] = React.useState("default")
    const [selectedRoom, setSelectedRoom] = React.useState("default")

    React.useEffect(() => {
        if (props.data) setDeviceData(props.data)
    }, [props.data]) 

    function handleStationChange(event : React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value
        if (value === "default") {
            setSelectedRoom("default")
        }
        setSelectedStation(value)
    }

    function handleRoomChange(event : React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value
        setSelectedRoom(value)
    }

    return (
        <div className="room-card-container">
            {deviceData && <select className="station-select" onChange={handleStationChange}>
                <option value="default">Station:</option>
                {getStations(deviceData)}
            </select>}
            { deviceData && selectedStation !== "default" &&
            <select className="room-select" onChange={handleRoomChange}>
                <option value="default">Raum:</option>
                {getRooms(deviceData, selectedStation)}
            </select> }
            <hr className="divider"/>
            { selectedRoom !=="default" &&
            <table className="device-table">
                <thead>
                    <tr>
                        <th>uuid</th>
                        <th>aktiv</th>
                        <th>ready</th>
                        <th>high</th>
                        <th>med</th>
                        <th>low</th>
                    </tr>
                </thead>
                <tbody>
                    {deviceData && populateTable(deviceData, selectedRoom)}
                </tbody>
            </table>
            }
        </div>
    )
}

export default RoomCard