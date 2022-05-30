import * as d3 from "d3"
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

export type DevicesPerClassPerStation = {
    class: string,
    devicesPerStation: Array<Dataset>
}

export type CaptionColourPair = {
    caption: string,
    colour: string
}

export function totalActivityData( data: Array<DeviceData>) {
    const ret: Array<Dataset> = []
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

// impelementation für geräte, die alle genau einer klasse zugehörig sind
export function devicesOfAClassPerStation ( data: Array<DeviceData>) {
    const ret : Array<DevicesPerClassPerStation> = []
    for (const device of data) {
        let entry_exists = false
        let member_exists = false
        const target_class = device.getClasses()
        const target_station = device.getLocation().split("-")[0]
        for (const entry of ret) {
            if (entry.class === target_class) {
                entry_exists = true
                for (const member of entry.devicesPerStation) {
                    if (member.sectionCaption === target_station) {
                        member_exists = true
                        member.sectionValue++
                    }
                }
                if (!member_exists) {
                    entry.devicesPerStation.push({
                        sectionCaption: target_station,
                        sectionValue: 1
                    })
                }
            }
        }
        if (!entry_exists) {
            ret.push({
                class: target_class,
                devicesPerStation: 
                [{
                    sectionCaption: target_station,
                    sectionValue: 1
                }]
            })
        }
    }
    for (const entry of ret) {
        const sorted_entry = entry.devicesPerStation.sort((a, b) => b.sectionCaption.localeCompare(a.sectionCaption))
        sorted_entry.reverse()
        entry.devicesPerStation = sorted_entry
    }
    const sorted_ret = ret.sort((a, b) => b.class.localeCompare(a.class))
    sorted_ret.reverse()
    return sorted_ret
}

export function stationColours(input : Array<DeviceData>) {
    const ret : Array<CaptionColourPair> = []
    let count = 0
    for (const device of input) {
        let known = false
        const station = device.getLocation().split("-")[0]
        for (const entry of ret) {
            if (entry.caption === station) {
                known = true
            }
        }
        if (!known) {
            ret.push({
            caption: station,
            colour: ""
            })
            count++
        }
    }
    const sorted_colour_pairs = ret.sort((a, b) => b.caption.localeCompare(a.caption))
    sorted_colour_pairs.reverse()
    const colours = colorArrayFromTwo("#026773", "#3CA6A6", sorted_colour_pairs.length)
    for (const item of sorted_colour_pairs) {
        item.colour = colours(sorted_colour_pairs.indexOf(item).toString())
    }
    return sorted_colour_pairs
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
    return ret
}

function convertDate(input: Date) {
    function pad(s: number) { return (s < 10) ? '0' + s : s}
    return [pad(input.getMonth() + 1), pad(input.getDate()), input.getFullYear()].join("-")
}

export function colorArrayFromTwo(start : string, end : string, range : number) {
    const linearScale = d3.scaleLinear<string>()
                            .domain([0, 1])
                            .range([start, end])

    const data = d3.range(range)
    let string_data = []
    for (let i = 0; i < data.length; i++) {
        string_data.push(data[i].toString())
    }

    const colorArray = d3.range(data.length).map(d => linearScale(d/data.length - 1))

    const ordinalScale = d3.scaleOrdinal<string>()
                            .domain(string_data)
                            .range(colorArray)

    return ordinalScale
}