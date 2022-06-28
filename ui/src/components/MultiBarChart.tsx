import React from "react";
import * as d3 from "d3";
import { DeviceData } from "../proto/frontend_pb";
import "./ChartContainer.css";
import "./MultiBarChart.css";
import { theme } from "../theme";

function MultiBarChart(props : {
    data : Array<DeviceData>
}) {

    const d3Chart = React.useRef(null)
    const [selection, setSelection] = React.useState<string>("default")
    const [data, setData] = React.useState<Array<DeviceUptime>>()
    const [title, setTitle] = React.useState<string>("XXXXXXXXXXXXXXXXX")
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
            current: number,
            maintain: number,
            total: number
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

    function sToHour(input : number) {
        const ret = input / 60 / 60
        return ret
    }

    function ensembleDeviceUptime(input : Array<DeviceData>) {
        const ensembles : Array<EnsembleDeviceList>= []
        for (const device of input) {
            let devicePushed = false
            if (device.getEnsembleList().length > 1) {
                for (const ensemble of ensembles) {
                    for (const item of ensemble.devices) {
                        if (device.getUuid() === item.uuid) {
                            item.data.current = sToHour(device.getRuntimecurrent())
                            item.data.maintain = sToHour(device.getRuntimemaintenance() - item.data.current)
                            item.data.total = sToHour(device.getRuntimetotal() - device.getRuntimemaintenance())
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
                                total: 0,
                                maintain: 0,
                                current: 0
                            }
                        })
                    }
                    const current = dev[dev.length - 1].data
                    current.current = sToHour(device.getRuntimecurrent())
                    current.maintain = sToHour(device.getRuntimemaintenance() - current.current)
                    current.total = sToHour(device.getRuntimetotal() - device.getRuntimemaintenance())
                    ensembles.push({
                        ensembleName: device.getLocation(),
                        devices: dev
                    })
                }
            }
        }
        const sorted_ensembles = ensembles.sort((a, b) => b.ensembleName.localeCompare(a.ensembleName))
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
                            .domain(data.map(function (d) {return (d.uuid.split("-")[0] + "...")}))
                            .range([0, chartHeight])
                            .padding(0.3)

            let xMax = 0
            for (const device of data) {
                const temp_total = device.data.total + device.data.maintain + device.data.current
                if (temp_total > xMax) xMax = temp_total 
            }

            const x = d3.scaleLinear()
                            .domain([0, xMax])
                            .range([0, chartWidth])

            const subgroups = ["current", "maintain", "total"]

            const colour = d3.scaleOrdinal()
                                .domain(subgroups)
                                .range(colours)

            const iterable_data = []
            for (const item of data) {
                iterable_data.push(item.data)
            }
            const stacked_data = d3.stack().keys(subgroups)(iterable_data)

            const tooltip = d3.select(".tooltip")
                            .style("opacity", 0)
            
            svg.selectAll("g")
                .data(stacked_data)
                .join(
                    enter => enter.append("g"),
                    update => update,
                    (exit) => 
                        exit.call((g) =>
                             g.transition().duration(0).style("opacity", 0).remove())
                )
                .attr("fill", (d) => (colour(d.key) as string))
                .attr("fill-opacity", 0.8)
                .selectAll("rect")
                    .data(function(d) {return d})
                    .join(
                        enter => enter.append("rect"),
                        update => update,
                        exit => 
                        exit.call((rect) =>
                             rect.transition().duration(0).style("opacity", 0).remove())
                    )
                    .attr("y", (_, i) =>  (i + 1) * (y.step() - y.bandwidth()) + i * y.bandwidth())
                    .attr("x", (d) => x(d[0]) + margin.left)
                    .attr("width", (d) => x(d[1]) - x(d[0]))
                    .attr("height", y.bandwidth())
                    .attr("stroke", "#424242")
                    
                    .on("mouseover", function(event, d) {
                        const parent_datum = d3.select(event.target.parentElement).datum()
                        // weiß nicht wie man diese Fehler beheben kann, da datum abhängig von der Gerätezahl immer unterschiedlich ist
                        // was typechecking schwierig macht.
                        const subgroup_name = parent_datum.key
                        
                        let subgroup_value
                        if (subgroup_name === "total") {
                            subgroup_value = Math.round((d.data[subgroup_name] + d.data["maintain"] + d.data["current"]) * 10) / 10
                        } else {
                            if (subgroup_name === "maintain") {
                                subgroup_value = Math.round((d.data[subgroup_name] + d.data["current"]) * 10) / 10
                            } else {
                                subgroup_value = Math.round(d.data[subgroup_name] * 10) / 10
                            }
                        }
                        d3.select(event.target.parentElement).transition()
                                        .duration(50)
                                        .attr("fill-opacity", 1);
                        tooltip
                            .html("subgroup: " + subgroup_name + "<br>" + "Value: " + subgroup_value + " h")
                            .style("opacity", 1)
                    })

                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", (d3.pointer(event, window)[0] - margin.left) + "px")
                            .style("top", (d3.pointer(event, window)[1] - 3*margin.top)  + "px")
                    })

                    .on("mouseout", function(event) {
                        d3.select(event.target.parentElement).transition()
                                        .duration(50)
                                        .attr("fill-opacity", 0.8);
                        tooltip
                            .style("opacity", 0)
                            .style("left", "0px")
                            .style("top", "0px")
                    })

            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("transform", "translate(" + margin.left + ", 0)") 
            
            svg.append("g")
                .call(d3.axisBottom(x))
                .attr("transform", "translate(" + margin.left + ", " + chartHeight + ")") 
                

        }
    }, [data])

    return (
        <div className="chart-container-select">
            <div className="select-container">
                <label className="select-label">Ensemble:</label>
                <select className="ensemble-select" id="ensemble-select" onChange={handleSelection}>
                    <option value="default">-Ensemble wählen:-</option>
                    {populateSelect(ensembleDeviceUptime(props.data))}
                </select>
            </div>
            <h3 className="chart-title">{title}</h3>
            <div className="sub-flex-container">
                {selection !== "default" && <svg ref={d3Chart}/>}
            </div>
            <div className="tooltip"></div>
        </div>
    )
}

export default MultiBarChart