import { lchown } from "fs"
import { isExternalModuleNameRelative } from "typescript"
import { DeviceData } from "./proto/frontend_pb"

export type Dataset = {
    sectionCaption: string,
    sectionValue: number,
}
export type PieDataSet = {
    captionArray: Array<string>,
    valueArray: Array<number>
}
export type ErrPerDate = {
    date: string,
    errNum: number 
}

export type ErrPerPrioPerDate = {
    priority: string,
    data: Array<ErrPerDate>
}

export type ErrSpreadChartData = {
    xDomain: Array<string>,
    dataSet: Array<ErrPerPrioPerDate>
}

export function totalActivityData( data: Array<DeviceData>) {
    const ret: Array<Dataset> =[]
    let active: Dataset = {
        sectionCaption: "active",
        sectionValue: 0
    }
    let inactive: Dataset = {
        sectionCaption: "inactive",
        sectionValue: 0
    }
    const dummy = data
    for(const point of dummy){
       point.getIsactive() ? active.sectionValue!++  : inactive.sectionValue!++
    }
    ret.push(active)
    ret.push(inactive)
    return ret
}

export function totalActivityData2( data: Array<DeviceData>) {
    const ret: Array<Dataset> =[]
    let a_u: Dataset = {
        sectionCaption: "active_usable",
        sectionValue: 0
    }
    let ia_u: Dataset = {
        sectionCaption: "inactive_usable",
        sectionValue: 0
    }
    let ia_uu: Dataset = {
        sectionCaption: "inactive_unusable",
        sectionValue: 0
    }
    const dummy = data
    for(const point of dummy){
        if (point.getIsactive()) {
            a_u.sectionValue!++
        } else {
            point.getIsusable()? ia_u.sectionValue!++  : ia_uu.sectionValue!++
        }
    }
    ret.push(a_u)
    ret.push(ia_u)
    ret.push(ia_uu)
    return ret
}

export function pieReadyData(input: Array<Dataset>) {
    const ret: PieDataSet = {
        captionArray: [],
        valueArray: []
    }

    for(const item of input) {
        ret.captionArray.push(item.sectionCaption)
        ret.valueArray.push(item.sectionValue)
    }

    return ret
}

export function errorSpreadData(input: Array<DeviceData>) {
    const data: Array<ErrPerPrioPerDate> = []
    const domain: Array<string> = []
    const low: ErrPerPrioPerDate = {
        priority: "low",
        data: []
    }
    const med: ErrPerPrioPerDate = {
        priority: "medium",
        data: []
    }
    const high: ErrPerPrioPerDate = {
        priority: "high",
        data: []
    }
    data.push(low, med, high)
    for (const item of input) {
        const target = item.getErrorsList()
        for (const error of target) {
            if (error.getId() !== 0) {
                const prio = error.getPriority()
                const date = new Date(error.getDate())
                const dateString = convertDate(date)
                for (const group of data) {
                    if (group.priority === prio) {
                        const data = group.data
                        let dateExists = false
                        for (const errDate of data) {
                            if (errDate.date === dateString) {
                                dateExists = true
                                errDate.errNum++
                            }
                        }
                        if (!dateExists) {
                            data.push({
                                date: dateString, 
                                errNum: 1
                            })
                        }
                    }
                }
                let dateInDomain = false
                for (const date of domain) {
                    if (date === dateString) {
                        dateInDomain = true
                    }
                }
                if (!dateInDomain) {
                    domain.push(dateString)
                }
            }
        }
    }
    for (const item of data) {
        item.data = item.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    const sorted_domain = domain.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    let final_sorted_domain = []
    const day_in_ms = 24 * 60 * 60 * 1000
    const is_ms = sorted_domain.length * day_in_ms
    const should_ms = new Date(sorted_domain[sorted_domain.length - 1]).getTime() - new Date(sorted_domain[0]).getTime()
    if ( should_ms > is_ms) {
        for (let i = 0; i < should_ms / (day_in_ms); i++) {
            final_sorted_domain.push(convertDate(new Date(new Date(sorted_domain[0]).getTime() + (i * day_in_ms))))
        }
    } else {
        final_sorted_domain = sorted_domain
    }

    for(const prio of data) {
        if (prio.data.length < final_sorted_domain.length) {
            for ( let i = 0; i < final_sorted_domain.length; i++ ) {
                if (prio.data[i].date !== final_sorted_domain[i]) {
                    prio.data.splice(i, 0, {date: final_sorted_domain[i], errNum: 0})
                }
            }
        }
    }

    const ret: ErrSpreadChartData = {
        xDomain: final_sorted_domain,
        dataSet: data
    }

    // maybe reverse the date string here after sorting for better reading
    // also maybe remove year if year is the same on all strings
    return ret
}

function convertDate(input: Date) {
    function pad(s: number) { return (s < 10) ? '0' + s : s}
    return [pad(input.getMonth() + 1), pad(input.getDate()), input.getFullYear()].join("-")
}

export function getStations(input: Array<DeviceData>) {
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

export function getRooms(input : Array<DeviceData>, station: string) {
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

export function populateTable(data: Array<DeviceData>, room : string) {
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
                    <td>{device.getUuid()}</td>
                    <td>{device.getIsactive().toString()}</td>
                    <td>{(device.getIsusable()).toString()}</td>
                    <td>{count_high}</td>
                    <td>{count_med}</td>
                    <td>{count_low}</td>
                </tr>
            )
        }
        return ret
    }
}