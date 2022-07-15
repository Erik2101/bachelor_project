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

function App() {

  const [deviceDataStore, setDeviceDataStore] = React.useState<Array<DeviceData>>()
  const [dataSetCount, setDataSetCount] = React.useState(0)

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

  function update(oldStore: Array<DeviceData> | undefined, responses: Array<ChartDatasetResponse>) {
    {
      if (!oldStore) { oldStore = [] }
      // let ret = oldStore
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
  }

  function handleClick() {
    setDataSetCount(prevCount =>  {return prevCount === 0 ? 1 : 0})
  }

  return (
    <div className="App">
      <header className="app-header">
        <button className="header-button">Filter verwalten.</button>
        <h1 id="app-title">SDC Control Station Med Visualisierungsbeispiele</h1>
        <button className="header-button" onClick={handleClick}>Datensatz wechseln.</button>
      </header>
      
        <TabLayout>
          <div id="Raummonitor">
            {deviceDataStore && <RoomCard data={deviceDataStore}/>}
          </div>
          <div id="Gerätepark">
            <main className="main-content">
              {deviceDataStore && <MultiBarChart data={deviceDataStore}/>}
              {deviceDataStore && <PieChart typeId={1} data={deviceDataStore}/>}
              {deviceDataStore && <MultiLineChart data={deviceDataStore}/>}
              {deviceDataStore && <BarChart typeId={2} data={deviceDataStore}/>}
              {deviceDataStore && <LolipopChart data={deviceDataStore}/>}
              {deviceDataStore && <BarChart typeId={1} data={deviceDataStore}/>}
              {deviceDataStore && <PieChart typeId={2} data={deviceDataStore}/>}
            </main>
          </div>
        </TabLayout>
    </div>
  );
}

export default App;
