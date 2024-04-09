import React, { useState, useEffect, useCallback } from "react";
import Trip from "./Trip";
import Splash from "./Splash";

const Daejeon = () => {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);

  const requestData = useCallback(async (type) => {
    const res = await fetch(`data/${type}.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const data = await res.json();
    const fileName = type.split("/")[1];
    setData((prev) => ({ ...prev, [fileName]: data }));
  }, []);

  const INITIAL_VIEW_STATE = {
    longitude: 127.38,
    latitude: 36.38,
    zoom: 10,
    minZoom: 12,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  };

  useEffect(() => {
    requestData("daejeon/electric_car_trip");
    requestData("daejeon/shuttle_bus_foot_trip");
    requestData("daejeon/shuttle_bus_trip");
    requestData("daejeon/bus_stop_path");
    requestData("daejeon/bus_stop_point");
    setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && <Splash />}
      {loaded && (
        <>
          <Trip
            env={"daejeon"}
            name={"셔틀버스"}
            data={data}
            INITIAL_VIEW_STATE={INITIAL_VIEW_STATE}
          />
          <Trip
            env={"daejeon"}
            name={"초소형 전기차"}
            data={data}
            INITIAL_VIEW_STATE={INITIAL_VIEW_STATE}
          />
        </>
      )}
    </>
  );
};

export default Daejeon;
