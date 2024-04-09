import React, { useState, useEffect, useCallback } from "react";
import Trip from "./Trip";
import Splash from "./Splash";

const Jeju = () => {
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
    longitude: 126.55,
    latitude: 33.35,
    zoom: 10,
    minZoom: 5,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  };

  useEffect(() => {
    requestData("jeju/electric_car_trip");
    requestData("jeju/general_car_trip");
    setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && <Splash />}
      {loaded && (
        <>
          <Trip
            env={"jeju"}
            name={"택시"}
            data={data}
            INITIAL_VIEW_STATE={INITIAL_VIEW_STATE}
          />
          <Trip
            env={"jeju"}
            name={"초소형 전기차"}
            data={data}
            INITIAL_VIEW_STATE={INITIAL_VIEW_STATE}
          />
        </>
      )}
    </>
  );
};

export default Jeju;
