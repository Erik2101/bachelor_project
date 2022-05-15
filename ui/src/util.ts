import { DeviceData } from "./proto/frontend_pb"

export type Dataset = {
    sectionCaption: string,
    sectionValue: number,
}
export type PieDataSet = {
    captionArray: Array<string>,
    valueArray: Array<number>
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
        sectionCaption: "active_useable",
        sectionValue: 0
    }
    let a_uu: Dataset = {
        sectionCaption: "active_unuseable",
        sectionValue: 0
    }
    let ia_u: Dataset = {
        sectionCaption: "inactive_useable",
        sectionValue: 0
    }
    let ia_uu: Dataset = {
        sectionCaption: "inactive_unuseable",
        sectionValue: 0
    }
    const dummy = data
    for(const point of dummy){
        if (point.getIsactive()) {
            point.getIsuseable()? a_u.sectionValue!++  : a_uu.sectionValue!++
        } else {
            point.getIsuseable()? ia_u.sectionValue!++  : ia_uu.sectionValue!++
        }
    }
    ret.push(a_u)
    ret.push(a_uu)
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