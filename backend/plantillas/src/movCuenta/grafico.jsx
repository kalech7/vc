import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const MovimientosChart = ({ movimientos, recargas }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
      },
      grid: {
        vertLines: { color: '#eeeeee' },
        horzLines: { color: '#eeeeee' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      priceScale: {
        autoScale: true,
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#2196f3',
      lineWidth: 10,
      crossHairMarkerVisible: true,
      crossHairMarkerRadius: 5, 
    });

    const formatData = (data) => {
      return data.map((item) => {
        const fecha = new Date(item.fecha);
        return {
          time: Math.floor(fecha.getTime() / 1000),
          value: parseFloat(item.monto),
        };
      });
    };

    const combinedData = [...formatData(movimientos), ...formatData(recargas)]
      .filter((data) => !isNaN(data.time) && !isNaN(data.value))
      .sort((a, b) => a.time - b.time);

    lineSeries.setData(combinedData);
    
    chart.timeScale().applyOptions({
      rightOffset: 10,
      barSpacing: 10,
    });
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [movimientos, recargas]);

  return <div ref={chartContainerRef} style={{ marginBottom: '20px' }} />;
};

export default MovimientosChart;
