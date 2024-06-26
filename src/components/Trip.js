import React, { useState, useEffect, useCallback } from "react";

import DeckGL from "@deck.gl/react";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { Map } from "react-map-gl";

import Slider from "@mui/material/Slider";
// import legend from "../img/legend.png";
import "../css/trip.css";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: 127.38,
  latitude: 36.38,
  zoom: 10,
  minZoom: 12,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
};

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const minTime = 480;
const maxTime = 660;
const animationSpeed = 1;
const mapStyle = "mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc";
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

const returnAnimationTime = (time) => {
  if (time > maxTime) {
    return minTime;
  } else {
    return time + 0.01 * animationSpeed;
  }
};

const addZeroFill = (value) => {
  const valueString = value.toString();
  return valueString.length < 2 ? "0" + valueString : valueString;
};

const returnAnimationDisplayTime = (time) => {
  const hour = addZeroFill(parseInt((Math.round(time) / 60) % 24));
  const minute = addZeroFill(Math.round(time) % 60);
  return [hour, minute];
};

const Trip = (props) => {
  const [time, setTime] = useState(minTime);
  const [animation] = useState([]);

  // console.log(props.data)

  const animate = useCallback(() => {
    setTime((time) => returnAnimationTime(time));
    animation.id = window.requestAnimationFrame(animate);
  }, [animation]);

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation, animate]);

  const layers = [
    props.env === "daejeon" &&
      new PathLayer({
        id: "bus-stop-path",
        data: props.data.bus_stop_path,
        pickable: true,
        widthScale: 1,
        widthMinPixels: 2,
        getPath: (d) => d.path,
        getColor: (d) => [255, 255, 0],
        getWidth: (d) => 1,
      }),
    new TripsLayer({
      id: "bus-trip",
      data:
        props.env === "daejeon" && props.name === "셔틀버스"
          ? props.data.shuttle_bus_trip
          : props.env === "mokpo" && props.name === "시내버스"
          ? props.data.bus_trip
          : false,
      getPath: (d) => d.trip,
      getTimestamps: (d) => d.timestamp,
      getColor: (d) =>
        props.env === "daejeon"
          ? [255, 0, 0]
          : props.env === "mokpo" &&
            props.name === "시내버스" &&
            d.type === "foot"
          ? [255, 255, 255]
          : [255, 0, 0],
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 0.8,
      currentTime: time,
      shadowEnabled: false,
    }),
    props.env === "daejeon" &&
      props.name === "셔틀버스" &&
      new TripsLayer({
        id: "bus-foot",
        data: props.data.shuttle_bus_foot_trip,
        getPath: (d) => d.trip,
        getTimestamps: (d) => d.timestamp,
        getColor: [255, 255, 255],
        opacity: 1,
        widthMinPixels: 5,
        trailLength: 0.8,
        currentTime: time,
        shadowEnabled: false,
      }),
    props.name === "초소형 전기차" &&
      new TripsLayer({
        id: "car-trip",
        data: props.data.electric_car_trip,
        getPath: (d) => d.trip,
        getTimestamps: (d) => d.timestamp,
        getColor: (d) =>
          d.type === "electric_car" ? [0, 0, 255] : [255, 255, 255],
        opacity: 1,
        widthMinPixels: 5,
        trailLength: 0.8,
        currentTime: time,
        shadowEnabled: false,
      }),
    props.env === 'jeju' && props.name === "택시" &&
      new TripsLayer({
        id: "taxi-trip",
        data: props.data.general_car_trip,
        getPath: (d) => d.trip,
        getTimestamps: (d) => d.timestamp,
        getColor: (d) => d.type === 'foot' ? [255, 255, 255] : [255, 0, 0],
        opacity: 1,
        widthMinPixels: 5,
        trailLength: 0.8,
        currentTime: time,
        shadowEnabled: false,
      }),
    props.env === "daejeon" &&
      props.name === "셔틀버스" &&
      new IconLayer({
        id: "bus-stop-point",
        data: props.data.bus_stop_point,
        pickable: false,
        iconAtlas:
          "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
        iconMapping: ICON_MAPPING,
        sizeMinPixels: 20,
        sizeMaxPixels: 20,
        sizeScale: 5,
        getIcon: (d) => "marker",
        getPosition: (d) => d.loc,
        getSize: (d) => 10,
        getColor: (d) => [255, 255, 0],
      }),
  ];

  const SliderChange = (value) => {
    const time = value.target.value;
    setTime(time);
  };

  const [hour, minute] = returnAnimationDisplayTime(time);

  return (
    <div className="trip-container" style={{ position: "relative" }}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={props.INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={mapStyle} mapboxAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
      <h1 className="time">
        TIME : {`${hour} : ${minute}`}
        <br />
        {props.name}
      </h1>
      <Slider
        id="slider"
        value={time}
        min={minTime}
        max={maxTime}
        onChange={SliderChange}
        track="inverted"
      />
      {/* <img className="legend" src={legend} alt="legend"></img> */}
    </div>
  );
};

export default Trip;
