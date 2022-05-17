import React from 'react';
import './App.css';
import Header from "./components/Header";
import BarChart from "./components/BarChart";
import PieChart from './components/PieChart';
import {ChartDatasetRequest} from "./proto/frontend_pb";
import {DataServiceClient} from "./proto/FrontendServiceClientPb";
import { DeviceData } from './proto/frontend_pb';
import AreaChart from './components/AreaChart';

function App() {

  const [deviceDataStore, setDeviceDataStore] = React.useState<Array<DeviceData>>([]) 

  React.useEffect(()  => {
    
      const client = new DataServiceClient("http://localhost:8080");
      const request = new ChartDatasetRequest ()
      request.setChartId(1)

      // Test ob Daten über envoy ankommen
      client.connectionTesting(request, {}, (error, resp) => {
        if(error) throw error;
        console.log(resp.toObject().hello)
      })

      const stream = client.chartDatasetGathering(request, {});
      stream.on("data", function(response) {
        setDeviceDataStore(oldStore => {
            const ret = [...oldStore]
            const resp = response.getDevicedata()
            if (resp) ret.push(resp)
          return ret
        })
      })
      stream.on("status", function(status) {
        console.log(status.code);
        console.log(status.details);
        console.log(status.metadata);
      })
      console.log(deviceDataStore.length)
  }, [])

  return (
    <div className="App">
      <Header />
      {deviceDataStore.length > 0 && <AreaChart data={deviceDataStore}/>}
      {deviceDataStore.length > 0 && <BarChart typeId={1} data={deviceDataStore}/>}
      {deviceDataStore.length > 0 && <BarChart typeId={2} data={deviceDataStore}/>}
      {deviceDataStore.length > 0 && <PieChart data={deviceDataStore}/>}
    </div>
  );
}

export default App;
