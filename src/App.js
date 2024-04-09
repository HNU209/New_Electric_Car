import React, { useState, useEffect } from "react";
import Daejeon from "./components/Daejeon";
import Mokpo from "./components/Mokpo";
import Jeju from "./components/Jeju";

import "mapbox-gl/dist/mapbox-gl.css";
import "./css/app.css";

const App = () => {
  const [targetPage, setTargetPage] = useState(<Daejeon />);
  const [targetIndex, setTargetIndex] = useState(0);

  useEffect(() => {
    const pList = document.body
      .getElementsByClassName("list")[0]
      .getElementsByTagName("p");
    console.log(pList);
    for (let i = 0; i < pList.length; i++) {
      if (i === targetIndex) {
        pList[i].style.color = "#046582";
      } else {
        pList[i].style.color = "#EFEFEF";
      }
    }
  }, [targetPage, targetIndex]);

  return (
    <div className="container">
      <div className="home">
        <div className="header">
          <div
            className="title"
            onClick={(prev) => {
              setTargetPage(<Daejeon />);
              setTargetIndex(0);
            }}
          >
            Electric Car
          </div>
          <div className="list">
            <p
              onClick={(prev) => {
                setTargetPage(<Daejeon />);
                setTargetIndex(0);
              }}
            >
              대전
            </p>
            <p
              onClick={(prev) => {
                setTargetPage(<Mokpo />);
                setTargetIndex(1);
              }}
            >
              목포
            </p>
            <p
              onClick={(prev) => {
                setTargetPage(<Jeju />);
                setTargetIndex(2);
              }}
            >
              제주
            </p>
          </div>
        </div>
        <div className="main">{targetPage}</div>
      </div>
    </div>
  );
};

export default App;
