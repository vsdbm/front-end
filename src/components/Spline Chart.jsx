import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  if (!infos?.length) return null;
  while (infos?.[0]?.x?.getFullYear() < 1970) infos.shift();
  const totalMonthDiff = useMemo(() => monthDiff(infos?.[0]?.x, infos?.[infos?.length - 1]?.x), [infos]);
  const options = {
    animationEnabled: true,
    title: {
      text: name
    },
    axisX: {
      interval: totalMonthDiff > 30 ? Math.round(totalMonthDiff / 30) : totalMonthDiff,
      intervalType: "month",
      labelFormatter: function (e) {
        return new Intl.DateTimeFormat(i18n.language, { month: '2-digit', year: 'numeric' }).format(new Date(e.value));
      }
    },
    axisY: {
      title: t('chart.amount'),
      // prefix: "$",
      includeZero: true
    },
    toolTip: {
      contentFormatter: function (e) {
        let content = "";
        for (let i = 0; i < e.entries.length; i++) {
          let entry = e.entries[i];
          let dateStr = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(new Date(entry.dataPoint.x));
          let countStr = new Intl.NumberFormat(i18n.language).format(entry.dataPoint.count);
          let yStr = new Intl.NumberFormat(i18n.language).format(entry.dataPoint.y || 0);

          content += `<span style="color: ${colors.color4};font-weight: bold;">${dateStr}:</span>`;
          content += "<br/>";
          content += `${t('chart.this_period')}: <span style="color: ${colors.color5};font-weight: bold;">${countStr}</span>`;
          content += "<br/>";
          content += `${t('chart.cumulative')}: <span style="color: ${colors.color5};font-weight: bold;">${yStr}</span>`;
        }
        return content;
      }
    },
    data: [
      {
        type: "spline",
        dataPoints: infos,
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
    return <h6>{t('chart.select_organism')}</h6>
  }
}

export default SplineChart;