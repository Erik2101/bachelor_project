import React from "react";
import { DeviceData } from "../proto/frontend_pb";
import { theme } from "../theme";
import { colorArrayFromTwo } from "../util";
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
                let count = [0, 0, 0] ///[high, medium, low]
                if (errors.length > 1) {
                    for (const error of errors) {
                        if (error.getId() !== 0) {
                            const prio = error.getPriority()
                            if (prio === "high") {
                                count[0]++
                            } else {
                                if (prio === "medium") {
                                    count[1]++
                                } else {
                                    count[2]++
                                }
                            }
                        }
                    }
                }
                let error_colours = [] // [high, medium, low]
                for (const value of count) {
                    if (value === 0) {
                        error_colours.push({color: "black"})
                    } else {
                        error_colours.push({
                            color: theme.high_prio,
                            fontWeight: 600
                        })
                    }
                }
                ret.push(
                    <tr>
                        <td className="uuid-cell">{device.getUuid()}</td>
                        <td className="activity-cell">{device.getIsactive().toString()}</td>
                        <td className="ready-cell">{(device.getIsusable()).toString()}</td>
                        <td className="high-cell" style={error_colours[0]}>{count[0]}</td>
                        <td className="medium-cell" style={error_colours[1]}>{count[1]}</td>
                        <td className="low-cell" style={error_colours[2]}>{count[2]}</td>
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

    function updateRoom() {
        const target = document.getElementById("room-select") as HTMLSelectElement
        if (target) {
            setSelectedRoom(target.value)
        } 
    }

    React.useEffect(() => {
        updateRoom()
    }, [selectedStation])

    function handleRoomChange(event : React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value
        setSelectedRoom(value)
    }

    function roomIndicator(int : number) {
        let property : number
        let class_name : string
        let label : string
        if (int === 0) {
            property = roomStatus[1]
            class_name = "room-ready-indicator"
            label = "Bereit:"
        } else {
            property = roomStatus[2]
            class_name = "room-active-indicator"
            label = "Aktiv:"
        }
        const ratio = property / roomStatus[0]
        const colours = colorArrayFromTwo(theme.i_u, theme.high_prio, 5)
        let background_color : string
        if (ratio === 1) { background_color = /* colours("0") */ theme.active } else {
            if (ratio > 0.9) { background_color = /* colours("1") */ theme.i_u } else {
                if (ratio > 0.7) { background_color = colours("2") } else {
                    if (ratio > 0.5) { background_color = /* colours("3") */ theme.medium_prio } else {
                        background_color = /* colours("4") */ theme.high_prio
                    }
                }
            }
        }
        const style = {background: background_color}
        const percentage : string = ratio >= 0.1 ? Math.round(ratio * 100).toString() + "%" : "0" + Math.round(ratio * 100).toString() + "%"
        return (
            <div className="indicator-container">
                <label className="indicator-label">{label}</label>
                <div className={class_name} style={style}>{percentage}</div>
            </div>
        )
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
            {deviceData &&
            <div className="select-container">
                <label className="select-label">Station:</label>
                <select className="station-select" onChange={handleStationChange}>
                    <option value="default">-Station wählen-</option>
                    {getStations(deviceData)}
                </select>
            </div>
            }
            { deviceData && selectedStation !== "default" &&
            <div className="select-container">
                <label className="select-label">Raum:</label>
                <select className="room-select" id="room-select" onChange={handleRoomChange}>
                    <option value="default">-Raum wählen-</option>
                    {getRooms(deviceData, selectedStation)}
                </select>
            </div> 
            }
            {selectedRoom!=="default" && roomIndicator(1)}
            {selectedRoom!=="default" && roomIndicator(0)}
            {selectedRoom !=="default" &&
            <div className="table-container">
                <table className="device-table">
                    <thead className="device-table-head">
                        <tr>
                            <th className="uuid-cell">uuid</th>
                            <th className="activity-cell">aktiv</th>
                            <th className="ready-cell">ready</th>
                            <th className="high-cell">high</th>
                            <th className="medium-cell">medium</th>
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