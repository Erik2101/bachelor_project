import React from "react";
import { DeviceData } from "../proto/frontend_pb";
import "./RoomCard.css";

function RoomCard(props: {data: Array<DeviceData>}) {

    const [deviceData, setDeviceData] = React.useState<Array<DeviceData>>()
    const [selectedStation, setSelectedStation] = React.useState("default")
    const [selectedRoom, setSelectedRoom] = React.useState("default")
    const [roomStatus, setRoomStatus] = React.useState<Array<number>>([])

    React.useEffect(() => {
        if (props.data) setDeviceData(props.data)
    }, [props.data]) 

    React.useEffect(() => {
        if (deviceData && selectedRoom !== "default") getRoomState(deviceData)    
    }, [deviceData, selectedRoom])

    function getStations(input: Array<DeviceData>) {
        let stations : Array<string> = []
        for (const device of input) {
            const split_array = device.getLocation().split("-")
            let knownStation = false
            for (const station of stations) {
                if (station === split_array[0]) {
                    knownStation = true
                }
            }
            if (!knownStation) stations.push(split_array[0])
        }
        const sorted_stations = stations.sort((a, b) => b.localeCompare(a))
        sorted_stations.reverse()
        let ret = []
        for (const station of sorted_stations) {
            ret.push(
                <option value={station} key={ret.length}>{station}</option>
            )
        }
        return ret
    }
    
    function getRooms(input : Array<DeviceData>, station: string) {
        let rooms : Array<string> = []
        for (const device of input) {
            const split_array = device.getLocation().split("-")
            let knownRoom = false
            for (const room of rooms) {
                if (room === device.getLocation()) {
                    knownRoom = true
                }
            }
            if (!knownRoom && split_array[0] === station) {
                rooms.push(device.getLocation())
            }
        }
        const sorted_rooms = rooms.sort((a, b) => b.localeCompare(a))
        sorted_rooms.reverse()
        let ret = []
        for (const room of sorted_rooms) {
            ret.push(
                <option value={room} key={ret.length}>{room}</option>
            )
        }
        return ret
    }
    
    function populateTable(data: Array<DeviceData>, room : string) {
        let ret = []
        if (room !== "default") {
            const devices_in_room = []
            for (const device of data) {
                if(device.getLocation() === room) {
                    devices_in_room.push(device)
                }
            }
            for (const device of devices_in_room) {
                const errors = device.getErrorsList()
                let count_high = 0
                let count_med = 0
                let count_low = 0
                if (errors.length > 1) {
                    for (const error of errors) {
                        if (error.getId() !== 0) {
                            const prio = error.getPriority()
                            if (prio === "high") {
                                count_high++
                            } else {
                                if (prio === "medium") {
                                    count_med++
                                } else {
                                    count_low++
                                }
                            }
                        }
                    }
                }
                ret.push(
                    <tr>
                        <td className="uuid-cell">{device.getUuid()}</td>
                        <td className="activity-cell">{device.getIsactive().toString()}</td>
                        <td className="ready-cell">{(device.getIsusable()).toString()}</td>
                        <td className="high-cell">{count_high}</td>
                        <td className="medium-cell">{count_med}</td>
                        <td className="low-cell">{count_low}</td>
                    </tr>
                )
            }
            return ret
        }
    }

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

    function roomIndicator(int : number) {
        let property : number
        let class_name : string
        if (int === 0) {
            property = roomStatus[1]
            class_name = "room-ready-indicator"
        } else {
            property = roomStatus[2]
            class_name = "room-active-indicator"
        }
        const ratio = property / roomStatus[0]
        let background_color : string
        if (ratio === 1) { background_color = "green" } else {
            if (ratio > 0.9) { background_color = "lime" } else {
                if (ratio > 0.7) { background_color = "yellow" } else {
                    if (ratio > 0.5) { background_color = "orange" } else {
                        background_color = "red"
                    }
                }
            }
        }
        const style = {background: background_color}
        const percentage : string = ratio >= 0.1 ? Math.round(ratio * 100).toString() + "%" : "0" + Math.round(ratio * 100).toString() + "%"
        return (<div className={class_name} style={style}>{percentage}</div>)
    }

    function getRoomState(input : DeviceData[]) {
        let active_device_count : number = 0
        let total_device_count : number = 0
        let ready_device_count : number = 0
        if (input) {
            for (const device of input) {
                if (device.getLocation() === selectedRoom) {
                    total_device_count++
                    if (device.getIsusable()) {
                        ready_device_count++
                        if (device.getIsactive()) active_device_count++
                    }
                }
            }
        }
        setRoomStatus([total_device_count, ready_device_count, active_device_count])
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
            {selectedRoom!=="default" && roomIndicator(1)}
            {selectedRoom!=="default" && roomIndicator(0)}
            {/* <hr className="divider"/> */}
            {selectedRoom !=="default" &&
            <div className="table-container">
                <table className="device-table">
                    <thead className="device-table-head">
                        <tr>
                            <th className="uuid-cell">uuid</th>
                            <th className="activity-cell">aktiv</th>
                            <th className="ready-cell">ready</th>
                            <th className="high-cell">high</th>
                            <th className="medium-cell">med</th>
                            <th className="low-cell">low</th>
                        </tr>
                    </thead>
                    <tbody className="device-table-body">
                        {deviceData && populateTable(deviceData, selectedRoom)}
                    </tbody>
                </table>
            </div>
            }
        </div>
    )
}

export default RoomCard