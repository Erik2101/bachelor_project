import React from "react";
import { DeviceData } from "../proto/frontend_pb";
import { theme } from "../theme";
import { colorArrayFromTwo, getRooms, getStations, sToHour } from "../util";
import MultiLineChart from "./MultiLineChart";
import "./RoomCard.css";

function RoomCard(props: {data: Array<DeviceData>}) {

    const [deviceData, setDeviceData] = React.useState<Array<DeviceData>>()
    const [roomDeviceData, setRoomDeviceData] = React.useState<Array<DeviceData>>()
    const [selectedStation, setSelectedStation] = React.useState("default")
    const [selectedRoom, setSelectedRoom] = React.useState("default")
    const [roomStatus, setRoomStatus] = React.useState<Array<number>>([])

    React.useEffect(() => {
        if (props.data) setDeviceData(props.data)
    }, [props.data]) 

    const getRoomState = React.useCallback((input : DeviceData[]) => {
        let active_device_count : number = 0
        let total_device_count : number = 0
        let ready_device_count : number = 0
        let devices : Array<DeviceData> = []
        if (input) {
            for (const device of input) {
                if (device.getLocation() === selectedRoom) {
                    devices.push(device)
                    total_device_count++
                    if (device.getIsusable()) {
                        ready_device_count++
                        if (device.getIsactive()) active_device_count++
                    }
                }
            }
        }
        setRoomStatus([total_device_count, ready_device_count, active_device_count])
        setRoomDeviceData(devices)
    }, [selectedRoom])

    React.useEffect(() => {
        if (deviceData && selectedRoom !== "default") getRoomState(deviceData)    
    }, [deviceData, selectedRoom, getRoomState])
    
    function populateTable(data: Array<DeviceData>, room : string) {
        let ret = []
        if (room !== "default") {
            const devices_in_room = []
            for (const device of data) {
                if(device.getLocation() === room) {
                    devices_in_room.push(device)
                }
            }
            let key_index = 0
            for (const device of devices_in_room) {
                const errors = device.getErrorsList()
                let count = [0, 0, 0] ///[high, medium, low]
                if (errors.length > 1) {
                    for (const error of errors) {
                        if (error.getId() !== 0) {
                            const prio = error.getPriority()
                            if (prio === "Hoch") {
                                count[0]++
                            } else {
                                if (prio === "Medium") {
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
                    <tr key={`row_${key_index}`}>
                        <td className="uuid-cell" key={`uuid_${key_index}`}>{device.getUuid()}</td>
                        <td className="activity-cell" key={`activity_${key_index}`}>{device.getIsactive().toString()}</td>
                        <td className="ready-cell" key={`ready_${key_index}`}>{(device.getIsusable()).toString()}</td>
                        <td className="high-cell" key={`high_${key_index}`} style={error_colours[0]}>{count[0]}</td>
                        <td className="medium-cell" key={`medium_${key_index}`} style={error_colours[1]}>{count[1]}</td>
                        <td className="low-cell" key={`low_${key_index}`} style={error_colours[2]}>{count[2]}</td>
                        <td className="staff-cell" key={`staff_${key_index}`}>{device.getStaff()}</td>
                        <td className="crt-cell" key={`crt_${key_index}`}>{`${(Math.round(sToHour(device.getRuntimecurrent()) * 10) / 10).toString()} h`}</td>
                        <td className="trt-cell" key={`trt_${key_index}`}>{`${(Math.round(sToHour(device.getRuntimetotal()) * 10) / 10).toString()} h`}</td>
                    </tr>
                )
                key_index++
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
            label = "Geräte Einsatzbereit:"
        } else {
            property = roomStatus[2]
            class_name = "room-active-indicator"
            label = "Geräte Aktiv:"
        }
        const ratio = property / roomStatus[0]
        const colours = colorArrayFromTwo(theme.i_u, theme.high_prio, 50)
        let background_color : string
        if (ratio === 1) { background_color = /* colours("0") */ theme.active } else {
            if (ratio > 0.9) { background_color = /* colours("1") */ theme.i_u } else {
                if (ratio > 0.7) { background_color = colours("20") } else {
                    if (ratio > 0.5) { background_color = /* colours("3") */ theme.medium_prio } else {
                        background_color = /* colours("4") */ theme.high_prio
                    }
                }
            }
        }
        const style = {color: background_color}
        const percentage : string = ratio >= 0.1 ? Math.round(ratio * 100).toString() + "%" : "0" + Math.round(ratio * 100).toString() + "%"
        return (
            <div className="indicator-container">
                <label className="indicator-label">{label}</label>
                {/* <div className={class_name} style={style}>{percentage}</div> */}
                <label className="indicator" style={style}>{property} / {roomStatus[0]} ( {percentage} )</label>
            </div>
        )
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
                            <th>Gerätekennzeichnung</th>
                            <th colSpan={2}> Gerätestatus</th>
                            <th colSpan={3}>Gerätefehler (Priorität)</th>
                            <th>Kontakt</th>
                            <th colSpan={2}>Betriebsdauer</th>
                        </tr>
                        <tr>
                            <th className="uuid-cell">UUID</th>
                            <th className="activity-cell">Aktiv</th>
                            <th className="ready-cell">Einsatzbereit</th>
                            <th className="high-cell">Hoch</th>
                            <th className="medium-cell">Medium</th>
                            <th className="low-cell">Niedrig</th>
                            <th className="staff-cell">zuständige Person</th>
                            <th className="crt-cell">aktuell</th>
                            <th className="trt-cell">gesamt</th>
                        </tr>
                    </thead>
                    <tbody className="device-table-body">
                        {deviceData && populateTable(deviceData, selectedRoom)}
                    </tbody>
                </table>
            </div>
            }
            {roomDeviceData && selectedRoom!=="default" && <MultiLineChart data={roomDeviceData} />}
        </div>
    )
}

export default RoomCard