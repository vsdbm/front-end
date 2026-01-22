import React, { useMemo } from 'react';
import CanvasJSReact from '../static/chats/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
import colors from '../static/colors.js';

function monthDiff(d1, d2) {
  if(!d1 || !d2) return 0;
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

export const SplineChart = ({ name, infos }) => {
  if (!infos?.length) return null;
  while (infos?.[0]?.x?.getFullYear() < 1970) infos.shift();
  const totalMonthDiff = useMemo(() => monthDiff(infos?.[0]?.x, infos?.[infos?.length - 1]?.x), [infos]);
  const options = {
    animationEnabled: true,
    title: {
      text: name
    },
    axisX: {
      valueFormatString: "MM/YYYY",
      interval: totalMonthDiff > 30 ? Math.round(totalMonthDiff / 30) : totalMonthDiff,
      intervalType: "month"
    },
    axisY: {
      title: "Amount",
      // prefix: "$",
      includeZero: true
    },
    data: [
      {
      yValueFormatString: "###,###,###",
      xValueFormatString: "MMMM YYYY",
      type: "spline",
      dataPoints: infos,
      toolTipContent: `
      <span style='"'color: ${colors.color4};font-weight: bold;'"'>{x}:</span>
      <br/>
      This period: <span style='"'color: ${colors.color5};font-weight: bold;'"'>{count}</span>
      <br/>
      Cumulative: <span style='"'color: ${colors.color5};font-weight: bold;'"'>{y}</span>`,
    },
  ]
  }
  if (infos) {
    return (
      <div>
        <CanvasJSChart options={options}
        /* onRef={ref => this.chart = ref} */
        />
        {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
      </div>
    );
  } else {
    return <h6>Select an organism</h6>
  }
}

export default SplineChart;