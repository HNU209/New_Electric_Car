import React, { useState, useEffect, useCallback } from "react";

import DeckGL from "@deck.gl/react";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { IconLayer } from "@deck.gl/layers";
import { ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { Map } from "react-map-gl";

import Slider from "@mui/material/Slider";
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

const INITIAL_VIEW_STATE = {
  longitude: 127.4,
  latitude: 36.35,
  zoom: 11,
  minZoom: 3,
  maxZoom: 100,
  pitch: 0,
  bearing: 0,
};

const minTime = 0;
const maxTime = 1440;
const animationSpeed = 6;
const mapStyle = "mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc";
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const returnAnimationTime = (time) => {
  if (time > maxTime) {
    return minTime;
  } else {
    return time + 0.01 * animationSpeed;
  }
};

const returnAnimationDisplayTime = (time) => {
  const hour = addZeroFill(parseInt((Math.round(time) / 60) % 24));
  const minute = addZeroFill(Math.round(time) % 60);
  return [hour, minute];
};

const addZeroFill = (value) => {
  const valueString = value.toString();
  return valueString.length < 2 ? "0" + valueString : valueString;
};

const passengerFiler = (value, time) => {
  return value.filter((d) => d.duration[0] <= time && d.duration[1] >= time);
};

const vehicleFilter = (value) => {
  const relocation_vehs = value.filter((d) => d.state === "relocation");
  const not_relocation_vehs = value.filter((d) => d.state !== "relocation");
  return [relocation_vehs, not_relocation_vehs];
};

const ColorMap = (state) => {
  if (state === "assigned") {
    return [253, 128, 93];
  } else if (state === "in-service") {
    return [253, 253, 0];
  } else if (state === "relocation") {
    return [23, 184, 190];
  }
};

const Trip = ({ data }) => {
  const [time, setTime] = useState(minTime);
  const [animation] = useState([]);

  const passenger = passengerFiler(data.passenger, time);
  const not_assigned_passenger = passengerFiler(
    data.not_assigned_passenger,
    time
  );
  const wait_vehs = passengerFiler(data.wait_vehs, time);

  const [relocation_vehs, not_relocation_vehs] = vehicleFilter(data.trip);

  const animate = useCallback(() => {
    setTime((time) => returnAnimationTime(time));
    animation.id = window.requestAnimationFrame(animate);
  }, [animation]);

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation, animate]);

  const layers = [
    new GeoJsonLayer({
      id: "geojson",
      data: data.grid,
      stroked: true,
      filled: false,
      lineWidthScale: 1,
      lineWidthMinPixels: 1,
      opacity: 0.5,
      getFillColor: (f) => [255, 255, 255],
      getLineColor: [153, 255, 51],
    }),
    new IconLayer({
      id: "wait-vehicls",
      data: wait_vehs,
      pickable: true,
      iconAtlas:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "marker",
      sizeScale: 5,
      getPosition: (d) => [d.location[1], d.location[0]],
      getSize: (d) => 3,
      getColor: (d) => [102, 178, 255],
    }),
    new ScatterplotLayer({
      id: "passenger",
      data: passenger,
      radiusScale: 2,
      radiusMinPixels: 2,
      getPosition: (d) => [d.location[1], d.location[0]],
      getFillColor: (d) => [0, 255, 0],
      getRadius: 1,
    }),
    new ScatterplotLayer({
      id: "not-assigned-passenger",
      data: not_assigned_passenger,
      radiusScale: 2,
      radiusMinPixels: 2,
      getPosition: (d) => [d.location[1], d.location[0]],
      getFillColor: (d) => [255, 255, 255],
      getRadius: 1,
    }),
    new TripsLayer({
      id: "relocation-vehicle",
      data: relocation_vehs,
      getPath: (d) => d.route,
      getTimestamps: (d) => d.timestamp,
      getColor: (d) => ColorMap(d.state),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 1,
      currentTime: time,
      shadowEnabled: false,
    }),
    new TripsLayer({
      id: "not-relocation-vehicle",
      data: not_relocation_vehs,
      getPath: (d) => d.route,
      getTimestamps: (d) => d.timestamp,
      getColor: (d) => ColorMap(d.state),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 0.2,
      currentTime: time,
      shadowEnabled: false,
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
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={mapStyle} mapboxAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
      <h1 className="time">TIME : {`${hour} : ${minute}`}</h1>
      <Slider
        id="slider"
        value={time}
        min={minTime}
        max={maxTime}
        onChange={SliderChange}
        track="inverted"
      />
    </div>
  );
};

export default Trip;
