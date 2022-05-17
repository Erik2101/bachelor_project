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
    const ret: ErrSpreadChartData = {
        xDomain: sorted_domain,
        dataSet: data
    }

    // maybe reverse the date string here after sorting for better reading
    // also maybe remove year if year is the same on all strings
    console.log(ret)
    return ret
}

function convertDate(input: Date) {
    function pad(s: number) { return (s < 10) ? '0' + s : s}
    return [pad(input.getMonth() + 1), pad(input.getDate()), input.getFullYear()].join("-")
}