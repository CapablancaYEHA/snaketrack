const lineLabelFunc = (a) => {
  return ` ${a.formattedValue} ₽`;
};

const dataPrice = {
  type: "line",
  yAxisID: "y",
  id: 1,
  label: "Полная цена",
  backgroundColor: "#DB431A",
  pointBackgroundColor: "#DB431A",
  borderColor: "#DB431A",
  borderWidth: 2,
  tension: 0.1,
  pointRadius: 2,
  pointStyle: "circle",
  spanGaps: true,
};

// const dataDiscount = {
//   type: "line",
//   yAxisID: "y1",
//   id: 2,
//   label: "Дискаунт",
//   backgroundColor: "#27ae60",
//   pointBackgroundColor: "#27ae60",
//   borderColor: "#27ae60",
//   borderWidth: 2,
//   tension: 0,
//   pointRadius: 2,
//   pointStyle: "circle",
//   spanGaps: true,
// };

export const makeLineData = (raw) => {
  //   const discountSet = {
  //     ...dataDiscount,
  //     data: raw.map((a) => ({ y: a.discount_price, x: a.changed_at || a.completed_at })),
  //   };

  const priceSet = {
    ...dataPrice,
    data: raw.map((a) => ({ y: a.sale_price, x: a.changed_at || a.completed_at })),
  };

  //   FIXME Только полную цену щас показываем!!!!
  return {
    datasets: ([] as any).concat(priceSet),
  };
};

const scaleYDefault = {
  position: "left",
  display: true,
  title: {
    display: true,
    text: "Цена",
    color: "rgba(178,178,178,0.9)",
  },
  grid: {
    color: "rgba(178,178,178,0.3)",
    borderColor: "rgba(178,178,178,0.3)",
    tickColor: "rgba(178,178,178,0.3)",
  },
  ticks: {
    color: "rgba(178,178,178,0.9)",
    precision: 0,
  },
};

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  clip: false,
  interaction: {
    mode: "nearest",
    intersect: false,
  },
  tooltip: {
    enabled: true,
  },
};

export const makeLineOptions = () => {
  return {
    ...defaultOptions,
    plugins: {
      annotation: {
        annotations: {
          medianLine: {
            type: "line",
            drawTime: "afterDatasetsDraw",
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 2,
            label: {
              content: (ctx) => {
                const trg = ctx.chart.data.datasets?.filter((a) => a.data && a.data.length > 1);
                if (trg.length === 0) return undefined;
                const dt = trg[0].data.map((a) => a.y);
                return `Ср. стоимость ${Number((dt.reduce((tot, acc) => tot + acc) / dt.length).toFixed(0)).toLocaleString("en-US")} ₽`;
              },
              display: true,
              rotation: 0,
              drawTime: "afterDatasetsDraw",
              font: { weight: "normal" },
              backgroundColor: "rgba(0,0,0,1)",
            },
            display: (ctx) => {
              const trg = ctx.chart.data.datasets?.filter((a) => a.data && a.data.length > 1);
              return trg.length !== 0;
            },
          },
        },
      },
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Цена, изменения во времени",
        color: "rgba(178,178,178,0.9)",
      },
      tooltip: {
        interaction: {
          mode: "nearest",
        },
        position: "nearest",
        callbacks: {
          label: lineLabelFunc,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        bounds: "ticks",
        time: {
          unit: "month",
          displayFormats: {
            day: "MMMM YY",
          },
          tooltipFormat: "DD MMM YYYY",
        },
        ticks: {
          stepSize: 1,
          autoSkip: true,
          autoSkipPadding: 20,
          source: "auto",
          color: "rgba(178,178,178,0.9)",
        },
        adapters: {
          date: {
            locale: "ru",
          },
        },
        grid: {
          color: "rgba(178,178,178,0.3)",
          borderColor: "rgba(178,178,178,0.3)",
          tickColor: "rgba(178,178,178,0.3)",
        },
      },
      y: scaleYDefault,
      //   y1: {
      //     display: true,
      //     title: {
      //       display: true,
      //       text: "Дискаунт",
      //       color: "rgba(178,178,178,0.9)",
      //     },
      //     position: "right",
      //     grid: {
      //       drawOnChartArea: false,
      //     },
      //     ticks: {
      //       color: "rgba(178,178,178,0.9)",
      //       precision: 0,
      //     },
      //   },
    },
  };
};
