import { LatLng, polyline, layerGroup, LayerGroup, Tooltip } from "leaflet";
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { SensorData } from "../../types/SensorData";
import { getColor } from "./changeMapViewUtils";
import ReactDOMServer from "react-dom/server";

export type ChangeMapViewProps = {
  positions: SensorData[];
};

const ChangeMapView: React.FC<ChangeMapViewProps> = ({ positions }) => {
  const pathsLayerRef = useRef<LayerGroup>(layerGroup());
  const map = useMap();

  useEffect(() => {
    const polylines: LatLng[] = [];

    pathsLayerRef.current.clearLayers();

    positions.forEach((sensorData: SensorData, index: number) => {
      if (index < positions.length - 1) {
        const latLngPos: LatLng[] = [];
        const nextPos = index + 1;
        const initPos = new LatLng(sensorData.lat, sensorData.lon);
        const endPos = new LatLng(
          positions[nextPos].lat,
          positions[nextPos].lon
        );
        latLngPos.push(initPos);
        latLngPos.push(endPos);

        polylines.push(initPos);

        const newPolyline = polyline(latLngPos, {
          color: getColor(sensorData.P25),
          weight: 5,
        });

        const TooltipContent = () => (
          <div
            style={{
              border: `1px solid ${getColor(sensorData.P25)}`,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: getColor(sensorData.P25),
                color: "white",
                padding: "5px",
                fontWeight: "bold",
              }}
            >
              Sensor Information
            </div>
            <div style={{ padding: "5px" }}>
              <div>
                <strong>P25:</strong> {sensorData.P25}
              </div>
              <div>
                <strong>P10:</strong> {sensorData.P10}
              </div>
              <div>
                <strong>Spd:</strong> {sensorData.spd}
              </div>
            </div>
          </div>
        );

        const tooltip = new Tooltip({
          offset: [0, 10],
          opacity: 0.9,
        }).setContent(
          ReactDOMServer.renderToString(<TooltipContent />)
        );
        newPolyline.bindTooltip(tooltip);

        pathsLayerRef.current.addLayer(newPolyline).addTo(map);
      } else {
        polylines.push(new LatLng(sensorData.lat, sensorData.lon));
      }
    });

    const multi = polyline(polylines);

    if (positions.length > 0) {
      map.fitBounds(multi.getBounds());
    }
  }, [positions]);

  return null;
};

export default ChangeMapView;
