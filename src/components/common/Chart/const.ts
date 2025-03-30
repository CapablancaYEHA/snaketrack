import { adapterLocale } from "@/utils/time";

adapterLocale();

const ticksByString = {
  seasons: 6,
  years: 1,
  months: 1,
  quarters: 1,
  days: 1,
  weeks: 7,
};

const timeByString = {
  seasons: {
    unit: "month",
    displayFormats: {
      month: "MMM YYYY",
    },
    tooltipFormat: "DD MMM YYYY",
  },
  years: {
    unit: "year",
    displayFormats: {
      month: "YYYY",
    },
    tooltipFormat: "DD MMM YYYY",
  },
  months: {
    unit: "month",
    displayFormats: {
      month: "MMM YYYY",
    },
    tooltipFormat: "DD MMM YYYY",
  },
  quarters: {
    unit: "quarter",
    displayFormats: {
      quarter: "[Q]Q YYYY",
    },
    tooltipFormat: "DD MMM YYYY",
  },
  weeks: {
    unit: "day",
    displayFormats: {
      day: "MM.YY",
    },
    tooltipFormat: "DD MMM YYYY",
  },
  days: {
    unit: "day",
    displayFormats: {
      day: "D.MM.YY",
    },
    tooltipFormat: "DD MMM YYYY",
  },
};

const scaleYDefault = {
  position: "left",
  display: true,
  title: {
    display: true,
    text: "Масса змеи",
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
  plugins: {
    legend: {
      display: true,
    },
    title: {
      display: true,
      text: "График изменения массы Животного и КО",
      color: "rgba(178,178,178,0.9)",
    },
    tooltip: {
      interaction: {
        mode: "nearest",
      },
      position: "nearest",
    },
  },
  interaction: {
    mode: "nearest",
    intersect: false,
  },
  tooltip: {
    enabled: true,
  },
};

export const makeOptions = (val) => {
  return {
    ...defaultOptions,
    scales: {
      x: {
        type: "time",
        time: timeByString[val],
        ticks: {
          stepSize: ticksByString[val],
          autoSkip: true,
          source: "data",
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
      y1: {
        display: true,
        title: {
          display: true,
          text: "Масса КО",
          color: "rgba(178,178,178,0.9)",
        },
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "rgba(178,178,178,0.9)",
          precision: 0,
        },
      },
    },
  };
};

const dataKO = {
  type: "line",
  yAxisID: "y1",
  id: 2,
  label: "Корм",
  borderColor: "rgb(153, 102, 255)",
  backgroundColor: "rgb(153, 102, 255)",
  borderWidth: 2,
  tension: 0.2,
  pointRadius: 2,
};

const dataSnake = {
  type: "line",
  yAxisID: "y",
  id: 1,
  label: "Животное",
  borderColor: "rgb(255, 159, 64)",
  backgroundColor: "rgb(255, 159, 64)",
  borderWidth: 2,
  tension: 0.2,
  pointRadius: 2,
};

export const makeChartData = (weight, feed, view: "ko" | "snake" | "both") => {
  if (view === "both" && feed.length === 0 && weight.length === 0) {
    return {
      datasets: [],
    };
  }
  let res: any[] = [];
  const koSet = {
    ...dataSnake,
    data: (feed ?? [])?.map((a) => ({ y: a.feed_weight, x: a.feed_last_at })),
  };
  const snakeSet = {
    ...dataKO,
    data: (weight ?? [])?.map((a) => ({ y: a.weight, x: a.date })),
  };

  if (view === "both") {
    res = res.concat(koSet).concat(snakeSet);
  }
  if (view === "ko") {
    res = res.concat(koSet);
  }
  if (view === "snake") {
    res = res.concat(snakeSet);
  }

  return {
    datasets: res,
  };
};
