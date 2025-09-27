import { adapterLocale, getDate, getDateObj } from "@/utils/time";

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
      day: "D.MM.YY",
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
  interaction: {
    mode: "nearest",
    intersect: false,
  },
  tooltip: {
    enabled: true,
  },
};

export const makeLineOptions = (val) => {
  return {
    ...defaultOptions,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "График изменения массы Змеи и статистика кормлений",
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
        time: timeByString[val],
        ticks: {
          stepSize: ticksByString[val],
          autoSkip: true,
          autoSkipPadding: 20,
          //   maxTicksLimit: 10,
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
  label: "Кормления",
  backgroundColor: "rgb(153, 102, 255)",
  pointBackgroundColor: (context) => {
    const index = context.dataIndex;
    const value = context.dataset.data[index];
    return value?.regurgitation ? "#e03131" : value?.refuse ? "#00FFC0" : "rgb(153, 102, 255)";
  },
  borderColor: (context) => {
    const index = context.dataIndex;
    const value = context.dataset.data[index];
    return value && value?.regurgitation ? "#e03131" : value && value?.refuse ? "#00FFC0" : "rgb(153, 102, 255)";
  },
  borderWidth: 2,
  tension: 0.2,
  pointRadius: 2,
  spanGaps: true,
};

const dataSnake = {
  type: "line",
  yAxisID: "y",
  id: 1,
  label: "Змея",
  backgroundColor: "#ff9f40",
  pointBackgroundColor: (context) => {
    const index = context.dataIndex;
    const value = context.dataset.data[index];
    return value && value?.is_clean === false ? "#a0a3a8" : "#ff9f40";
  },
  borderColor: (context) => {
    const index = context.dataIndex;
    const value = context.dataset.data[index];
    return value && value?.is_clean === false ? "#a0a3a8" : "#ff9f40";
  },
  borderWidth: 2,
  tension: 0.2,
  pointRadius: 2,
  pointStyle: "circle",
  spanGaps: true,
};

const findLastValid = (ind: number, arr: any[]) => {
  if (ind < 0) {
    return null;
  }
  return arr[ind].feed_weight ? arr[ind].feed_weight : findLastValid(ind - 1, arr);
};

export const makeLineData = (weight, feed, view: "ko" | "snake" | "both") => {
  if (view === "both" && feed.length === 0 && weight.length === 0) {
    return {
      datasets: [],
    };
  }
  let res: any[] = [];
  const koSet = {
    ...dataKO,

    data: (feed ?? [])
      ?.sort((a, b) => getDateObj(a.feed_last_at) - getDateObj(b.feed_last_at))
      ?.map((a, ind, self) => {
        const lastValid = a.feed_weight ?? findLastValid(ind - 1, self);
        return { y: lastValid, x: a.feed_last_at, regurgitation: a.regurgitation || false, refuse: a.refuse || false };
      }),
  };
  const snakeSet = {
    ...dataSnake,
    data: (weight ?? [])?.map((a) => ({ y: a.weight, x: a.date, is_clean: a.is_clean })).sort((a, b) => getDateObj(a.x) - getDateObj(b.x)),
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

const bubbleLabelFunc = (a) => {
  return ` ${getDate(a.raw.x)}`;
};

const lineLabelFunc = (a) => {
  if (a.raw.regurgitation) {
    return " Срыг";
  }
  if (a.raw.refuse) {
    return " Отказ";
  }
  if (a.raw.is_clean === false) {
    return ` ${a.formattedValue}г с экскрецией`;
  }
  return ` ${a.formattedValue}г`;
};

export const bubbleOptions = {
  ...defaultOptions,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Периодичность линьки",
      color: "rgba(178,178,178,0.9)",
    },
    tooltip: {
      interaction: {
        mode: "nearest",
      },
      position: "nearest",
      callbacks: {
        label: bubbleLabelFunc,
      },
    },
  },
  tooltip: {
    enabled: true,
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "month",
        displayFormats: {
          day: "MMMM YY",
        },
        tooltipFormat: "DD MMM YYYY",
      },
      ticks: {
        stepSize: 1,
        source: "data",
        color: "rgba(178,178,178,0.9)",
        maxRotation: 30,
        minRotation: 20,
      },
      adapters: {
        date: {
          locale: "ru",
        },
      },
      grid: {
        tickColor: "rgba(178,178,178,0.3)",
      },
    },
    y: {
      display: false,
      title: {
        display: false,
      },
      ticks: {
        precision: 0,
      },
    },
  },
};

const dataShed = {
  borderColor: "#82c91e",
  backgroundColor: "#82c91e",
  borderWidth: 2,
  pointRadius: 2,
  spanGaps: true,
};

export const makeBubbleData = (arr: string[]) => {
  const a = arr?.map((b) => ({ x: b, y: 0 }));
  return {
    datasets: [
      {
        ...dataShed,
        data: a,
      },
    ],
  };
};
