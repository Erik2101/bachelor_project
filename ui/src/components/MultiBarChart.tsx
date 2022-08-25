import React from "react";
import * as d3 from "d3";
import { DeviceData } from "../proto/frontend_pb";
import "./ChartContainer.css";
import { theme } from "../theme";
import { sToHour } from "../util";

function MultiBarChart(props : {
    data : Array<DeviceData>
}) {

    const d3Chart = React.useRef(null)
    const [selection, setSelection] = React.useState<string>("default")
    const [data, setData] = React.useState<Array<DeviceUptime>>()
    const [title, setTitle] = React.useState<string>("")
    const [colours, setColours] = React.useState<Array<string>>(["red", "blue", "green"])

    React.useEffect(() => {
        if (data) drawChart()
    }, [data])

    React.useEffect(() => {
        updateEnsList()
    }, [props])

    React.useEffect(() => {
        setTitle("Betriebsdauern aller Geräte eines SDC-Ensembles (in Stunden)")
        setColours([theme.blue1, theme.blue3, theme.blue4])
        if (selection !== "default") {
            const temp = ensembleDeviceUptime(props.data)
            for (const ensemble of temp) {
                if (selection === ensemble.ensembleName) {
                    setData(ensemble.devices)
                }
            }
        }
        return () => {};      
    }, [props, selection])

    type DeviceUptime = {
        uuid: string,
        data: {
            Zuletzt: number,
            Wartung: number,
            Gesamt: number
        }
    }

    type EnsembleDeviceList = {
        ensembleName: string,
        devices: Array<DeviceUptime>
    }

    function handleSelection(event : React.ChangeEvent<HTMLSelectElement>) {
        setSelection(event.target.value)
    }

    function updateEnsList() {
        const target = document.getElementById("ensemble-select") as HTMLSelectElement
        if (target) {
            setSelection(target.value)
        } 
    }

    function ensembleDeviceUptime(input : Array<DeviceData>) {
        const ensembles : Array<EnsembleDeviceList> = []
        for (const device of input) {
            let devicePushed = false
            if (device.getEnsembleList().length > 1) {
                for (const ensemble of ensembles) {
                    for (const item of ensemble.devices) {
                        if (device.getUuid() === item.uuid) {
                            item.data.Zuletzt = sToHour(device.getRuntimecurrent())
                            item.data.Wartung = sToHour(device.getRuntimemaintenance() - device.getRuntimecurrent())
                            item.data.Gesamt = sToHour(device.getRuntimetotal() - device.getRuntimemaintenance())
                            devicePushed = true 
                        }
                    }
                }
                if (!devicePushed) {
                    const dev : Array<DeviceUptime> = []
                    for (const member of device.getEnsembleList()) {
                        dev.push({
                            uuid: member,
                            data: {
                                Gesamt: 0,
                                Wartung: 0,
                                Zuletzt: 0
                            }
                        })
                    }
                    const current = dev[dev.length - 1].data
                    current.Zuletzt = sToHour(device.getRuntimecurrent())
                    current.Wartung = sToHour(device.getRuntimemaintenance() - device.getRuntimecurrent())
                    current.Gesamt = sToHour(device.getRuntimetotal() - device.getRuntimemaintenance())
                    ensembles.push({
                        ensembleName: device.getLocation(),
                        devices: dev
                    })
                }
            }
        }
        let device_sorted_ens = []
        for (const ensemble of ensembles) {
            const temp = ensemble.devices.sort((a, b) => (a.data.Gesamt + a.data.Wartung + a.data.Zuletzt) - (b.data.Gesamt + b.data.Wartung + b.data.Zuletzt))
            temp.reverse()
            device_sorted_ens.push(ensemble)
        }
        const sorted_ensembles = device_sorted_ens.sort((a, b) => b.ensembleName.localeCompare(a.ensembleName))
        sorted_ensembles.reverse()
        return sorted_ensembles
    }

    function populateSelect(input : Array<EnsembleDeviceList>) {
        const ret = []
        for (const ensemble of input) {
            ret.push(
                <option value={ensemble.ensembleName} key={input.indexOf(ensemble)}>{ensemble.ensembleName}</option>
            )
        }
        return ret
    }

    function generateLegend() {
        if (data) {
            let result = []
            for (let key in data[0].data) {
                if (data[0].data.hasOwnProperty(key)) {
                    result.push(key)
                }
            }
            let ret : Array<JSX.Element> = []
            let idx
            result.reverse()
            for (const item of result ) {
                idx = result.indexOf(item)    
                const style = {backgroundColor: colours[idx]}
                const temp = (
                    <div className="legend-item-vert" key={item}>
                        <div className="legend-color" style={style}></div>
                        <label className="legend-label">{item}</label>
                    </div>
                )
                ret.push(temp)
            }
            return ret
        }
        return <></>
    }

    const drawChart = React.useCallback(() => {
        const containerWidth = parseInt(d3.select(".sub-flex-container").style("width"))
        const containerHeight = parseInt(d3.select(".sub-flex-container").style("height"))
        const margin = {
            top: containerHeight * 0.05,
            right: containerWidth * 0.05,
            bottom: containerHeight * 0.05,
            left: containerWidth * 0.10
        }
        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom
    
        const svg = d3.select(d3Chart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [0, 0, containerWidth, containerHeight])

        if (data) {

            const y = d3.scaleBand()
                            .domain(data.map(function (d) {return (d.uuid.split("-")[0])}))
                            .range([0, chartHeight])
                            .padding(0.3)

            let xMax = 0
            for (const device of data) {
                const temp_total = device.data.Gesamt + device.data.Wartung + device.data.Zuletzt
                if (temp_total > xMax) xMax = temp_total
            }

            const x = d3.scaleLinear()
                            .domain([0, xMax])
                            .range([0, chartWidth])
                            .nice()

            const subgroups = ["Zuletzt", "Wartung", "Gesamt"]

            const colour = d3.scaleOrdinal()
                                .domain(subgroups)
                                .range(colours)

            const iterable_data = []
            for (const item of data) {
                iterable_data.push(item.data)
            }
            console.log(iterable_data, null, "  ")
            const stacked_data = d3.stack().keys(subgroups)(iterable_data)
            console.log(JSON.stringify(stacked_data, null, "  "))
            const tooltip = d3.select(".tooltip")
                            .style("opacity", 0)

            svg.selectAll(".grid").remove()

            // create grouping for each subgroup of stacked_data (Gesamt, Wartung, Zuletzt)
            svg.selectAll("g")
                .data(stacked_data)
                // define lifecycle actions for each grouping
                .join(
                    enter => enter.append("g"),
                    update => update,
                    (exit) => 
                        exit.call((g) =>
                             g.transition().duration(0).style("opacity", 0).remove())
                )
                //style each appended grouping
                .attr("fill", (d) => (colour(d.key) as string))
                .attr("fill-opacity", 1)
                // create rectangle for each member of each subgroup
                .selectAll("rect")
                    .data(function(d) {return d})
                    // define lifecycle actions for each rectangle
                    .join(
                        enter => enter.append("rect"),
                        update => update,
                        exit => 
                        exit.call((rect) =>
                             rect.transition().duration(0).style("opacity", 0).remove())
                    )
                    // set dimensions of each rectangle according to corresponding part of stacked_data
                    .attr("y", (_, i) =>  (i + 1) * (y.step() - y.bandwidth()) + i * y.bandwidth())
                    .attr("x", (d) => x(d[0]) + margin.left)
                    .attr("width", (d) => x(d[1]) - x(d[0]))
                    .attr("height", y.bandwidth())
                    // style each appended rectangle
                    .attr("stroke", "#424242")
                    
                    .on("mouseover", function(event, d) {
                        const parent_datum = d3.select(event.target.parentElement).datum()
                        if (typeof parent_datum === "object" && parent_datum !== null && "key" in parent_datum) {
                            //@ts-ignore
                            const subgroup_name = parent_datum.key 
                            let subgroup_value
                            if (subgroup_name === "Gesamt") {
                                subgroup_value = Math.round((d.data[subgroup_name] + d.data["Wartung"] + d.data["Zuletzt"]) * 10) / 10
                            } else {
                                if (subgroup_name === "Wartung") {
                                    subgroup_value = Math.round((d.data[subgroup_name] + d.data["Zuletzt"]) * 10) / 10
                                } else {
                                    subgroup_value = Math.round(d.data[subgroup_name] * 10) / 10
                                }
                            }
                            d3.select(event.target.parentElement).transition()
                                            .duration(50)
                                            .attr("fill-opacity", 0.75);
                            tooltip
                                .html("Variable: " + subgroup_name + "<br>" + "Wert: " + subgroup_value + " h")
                                .style("opacity", 1)
                        }                        
                    })

                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", (d3.pointer(event, window)[0] - Math.max(100, margin.left)) + "px")
                            .style("top", (d3.pointer(event, window)[1] - Math.max(50, 3*margin.top))  + "px")
                    })

                    .on("mouseout", function(event) {
                        d3.select(event.target.parentElement).transition()
                                        .duration(50)
                                        .attr("fill-opacity", 1);
                        tooltip
                            .style("opacity", 0)
                            .style("left", "0px")
                            .style("top", "0px")
                    })

            let yAxis = svg.append("g")
                            .call(d3.axisLeft(y))
                            .attr("transform", "translate(" + margin.left + ", 0)")
                            .style("font-size", "14px")

            // define hover tooltip for yAxis ticks
            yAxis.selectAll(".tick")
                    .data(data)
                    // show tooltip when hovering axis label
                    .on("mouseover", function(_, d) {
                        tooltip
                            .html(d.uuid)
                            .style("opacity", 1)
                    })
                    // move tooltip according to mouse position
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", (d3.pointer(event, window)[0] - margin.left) + "px")
                            .style("top", (d3.pointer(event, window)[1] - 3*margin.top)  + "px")
                    })
                    // hide tooltip when not hovering
                    .on("mouseout", function() {
                        tooltip
                        .style("opacity", 0)
                        .style("left", "0px")
                        .style("top", "0px")
                    })
            
            svg.append("g")
                .call(d3.axisBottom(x))
                .attr("transform", "translate(" + margin.left + ", " +  chartHeight + ")")
                .style("font-size", "14px")

            const vert_gridlines = d3.axisBottom(x)
                .tickFormat( _ => "")
                .tickSize(-chartHeight)

            svg.insert("g", "g:first-child")
                .attr("class", "grid")
                .call(vert_gridlines)
                    .attr("transform", "translate(" + margin.left + "," + chartHeight + ")")
                    .style("stroke", theme.app_bg)
                    .attr("opacity", 0.5)
                    .attr("stroke-width", 0.5)

        }
    }, [data])

    return (
        <div className="chart-container-select with-legend">
            <div className="select-container">
                <label className="select-label">Ensemble:</label>
                <select className="ensemble-select" id="ensemble-select" onChange={handleSelection}>
                    <option value="default">-Ensemble wählen:-</option>
                    {populateSelect(ensembleDeviceUptime(props.data))}
                </select>
            </div>
            <h3 className="chart-title">{title}</h3>
            {DeviceData && colours && 
                        <div className="legend-container vertical">
                            {generateLegend()}
                        </div>}
            <div className="sub-flex-container">
                {selection !== "default" && <svg ref={d3Chart}/>}
            </div>
            <div className="tooltip"></div>
        </div>
    )
}

export default MultiBarChart