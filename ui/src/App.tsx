import React from 'react';
import './App.css';
import BarChart from "./components/BarChart";
import PieChart from './components/PieChart';
import {ChartDatasetRequest, ChartDatasetResponse} from "./proto/frontend_pb";
import {DataServiceClient} from "./proto/FrontendServiceClientPb";
import { DeviceData } from './proto/frontend_pb';
import RoomCard from './components/RoomCard';
import MultiLineChart from './components/MultiLineChart';
import MultiBarChart from './components/MultiBarChart';
import LolipopChart from './components/LolipopChart';
import TabLayout from './components/TabLayout';
import Popup from './components/Popup';

export type Options = {
  "station" : Array<string>,
  "device_class" : Array<string>
}

function App() {

  const [deviceDataStore, setDeviceDataStore] = React.useState<Array<DeviceData>>()
  const [dataSetCount, setDataSetCount] = React.useState(0)
  const [filterOptions, setFilterOptions] = React.useState<Options>({
    "station" : [],
    "device_class" : []
  })
  const [filteredDeviceData, setFilteredDeviceData] = React.useState<Array<DeviceData>>()
  const [popupState, setPopupState] = React.useState(false)

  React.useEffect(()  => {
      const client = new DataServiceClient("http://localhost:8080");
      const request = new ChartDatasetRequest ()
      request.setChartId(dataSetCount + 1)

      // Test ob Daten über envoy ankommen
      client.connectionTesting(request, {}, (error, resp) => {
        if(error) throw error;
        console.log(resp.toObject().hello)
      })

      let streamData : Array<ChartDatasetResponse> = []
      const stream =  client.chartDatasetGathering(request, {});
      stream.on("data", function (response) {
          streamData.push(response)
        })
      stream.on("status", function(status) {
      })
      stream.on("end", function() {
        if (streamData.length > 0) {
          setDeviceDataStore(oldStore => update(oldStore, streamData))
        }
      })
  }, [dataSetCount])

  React.useEffect(() => {
    if(deviceDataStore && filterOptions.device_class.length === 0 && filterOptions.station.length === 0) {
      console.log("am here")
      setFilteredDeviceData(deviceDataStore)
    }
  }, [deviceDataStore])

  React.useEffect(() => {
    let step1 : Array<DeviceData> = []
    let step2 : Array<DeviceData> = []
    // filter device data according to filter option selections and return remaining devices
    if (deviceDataStore) {
      if (filterOptions.device_class.length > 0) {
        for (const device of deviceDataStore) {
          for (const fltr_item of filterOptions.device_class) {
            if (device.getClasses() === fltr_item) {
              step1.push(device)
            }
          }
        }
      } else {
        step1 = deviceDataStore
      }
      if (filterOptions.station.length > 0) {
        for (const device of step1) {
          const temp_split = device.getLocation().split("-")
          for (const fltr_item of filterOptions.station) {
            if (temp_split[0] === fltr_item) {
              step2.push(device)
            }
          }
        }
      } else {
        step2 = step1
      }
      setFilteredDeviceData(step2)
    }
  }, [filterOptions, deviceDataStore])

  function update(oldStore: Array<DeviceData> | undefined, responses: Array<ChartDatasetResponse>) {
      if (!oldStore) { oldStore = [] }
      let ret : Array<DeviceData> = []
      let respPushed = false
      for(const response of responses) {
        const resp = response.getDevicedata()
        if (resp) {
          for (const item of oldStore) {
            if(item.getUuid() === resp.getUuid()) {
              ret[ret.indexOf(item)] = resp
              respPushed = true
            }
          }
          if (!respPushed) {
            ret.push(resp)
            respPushed = false
          }
        }
      }
    return ret
  }

  function handleClick() {
    setDataSetCount(prevCount =>  {return prevCount === 0 ? 1 : 0})
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1 id="app-title">SDC Control Station Med - Visualisierungsbeispiele</h1>
        <button className="header-button" onClick={handleClick}>Datensatz wechseln</button>
        <button className="header-button" onClick={() => {setPopupState(true)}}>Filteroptionen</button>
      </header>
      <TabLayout>
        <div id="Überwachung Gerätepark">
          <main className="main-content">
            {deviceDataStore && <Popup data={deviceDataStore}  current={filterOptions} trigger={popupState} setTrigger={setPopupState} submitFunction={setFilterOptions}/>}
            {filteredDeviceData && <MultiBarChart data={filteredDeviceData}/>}
            {filteredDeviceData && <PieChart typeId={1} data={filteredDeviceData}/>}
            {filteredDeviceData && <MultiLineChart data={filteredDeviceData}/>}
            {filteredDeviceData && <BarChart typeId={2} data={filteredDeviceData}/>}
            {filteredDeviceData && <LolipopChart data={filteredDeviceData}/>}
            {filteredDeviceData && <BarChart typeId={1} data={filteredDeviceData}/>}
            {filteredDeviceData && <PieChart typeId={2} data={filteredDeviceData}/>}
          </main>
        </div>
        <div id="Raummonitor">
          {deviceDataStore && <RoomCard data={deviceDataStore}/>}
        </div>
      </TabLayout>
    </div>
  );
}

export default App;
