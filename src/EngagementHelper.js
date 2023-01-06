const monthName = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]; // required for x-axis labelling

// converts date string into milliseconds for plotting the spline chart
const getMilliseconds = (time) => {
  const myDate = new Date(time);
  return myDate.getTime();
};

const getCountDatesForEachChannel = (messageCountList) => {
  const obj = {};

  messageCountList.forEach((item, index) => {
    if (item.channelId in obj) {
      obj[item.channelId] = obj[item.channelId] + 1;
    } else {
      obj[item.channelId] = 1;
    }
  });
  return obj;
};

const getFilteredMessageCountList = (
  messageCountList,
  countDatesForEachChannel
) => {
  return messageCountList.filter((item, index) => {
    if (countDatesForEachChannel[item.channelId] > 1) return true;

    return false;
  });
};

const sortMessageObjAsPerDate = (list) => {
  list.sort(function (a, b) {
    return new Date(b.timeBucket) - new Date(a.timeBucket);
  });

  return list;
};

const getHighChartData = (list) => {
  const data = [];
  list.forEach((item, index) => {
    item.timeMs = getMilliseconds(item.timeBucket);
    data.push([getMilliseconds(item.timeBucket), parseInt(item.count)]);
  });
  return data;
};

const getMapTimeWithChannels = (list) => {
  const obj = {};

  list.forEach((item, index) => {
    if (item.timeMs in obj) {
      obj[item.timeMs].push(item);
    } else {
      obj[item.timeMs] = [item];
    }
  });

  return obj;
};

const getMapChannelId = (channels) => {
  const obj = {};
  channels.forEach((item, index) => {
    obj[item.id] = item;
  });
  return obj;
};

// Need to get Label in DD MMM format.
function getDuration(milli) {
  const date = new Date(milli);
  const d = date.getDate();
  const m = date.getMonth();

  return `${d} ${monthName[m]}`;
}

const engagementMessageOverTimeChartOptions = (messageCountList, channels) => {
  // counting dates for each channel to filter out the messagecountlist having channels less than or equal to 1 date
  const countDatesForEachChannel =
    getCountDatesForEachChannel(messageCountList);

  // Filtering messageCOuntList
  const FilteredMessageCountList = getFilteredMessageCountList(
    messageCountList,
    countDatesForEachChannel
  );

  // I am assuming data might not be sorted so sorting the data as per Dates
  const sortedMessageCountList = sortMessageObjAsPerDate(
    FilteredMessageCountList
  );

  // Creating chart Data format
  const seriesData = getHighChartData(sortedMessageCountList);

  // I am assuming that there might be possibiity of multiple channels on same date in that case will show all the channels label on tooltip for that specific date, so for that creating dates hash mapping with channels.
  // Though In the given data there is nomultiple channels in same date.
  const mapTimeWithChannels = getMapTimeWithChannels(FilteredMessageCountList);

  // Creating channel id hash mapping with channel details because then it would take only o(1) time to get the channel details from channel id
  const mapChannelId = getMapChannelId(channels);

  const getChannels = (timeMs) => {
    return mapTimeWithChannels[timeMs];
  };

  function myFormatter() {
    const channelsOnX = getChannels(this.x); // getting channels for specific date

    return channelsOnX.map((item, index) => {
      // showing all channels if present more than 1 for specific date
      return (
        "<div style='color: white;'><b>" +
        mapChannelId[item.channelId].label +
        "</b>" +
        "<br></br><b>" +
        this.y +
        "</b> messages on <b>" +
        getDuration(this.x) +
        "</b></div>"
      );
    });
  }

  const chartOption = {
    chart: {
      type: "spline",
      inverted: false,
    },
    title: {
      text: "Showing message counts for each date and channels that have messages for more than 1 date",
      align: "left",
    },
    xAxis: {
      title: {
        enabled: true,
        text: "Dates",
      },
      labels: {
        formatter: function () {
          let result = {};
          if (this.value) {
            result = getDuration(this.value);
            return result;
          }

          return this.value;
        },
      },
      gridLineWidth: 0,
      showLastLabel: true,
    },
    yAxis: {
      title: {
        text: "Counts",
      },
      labels: {
        format: "{value}",
      },
      gridLineWidth: 0,
      lineWidth: 1,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      formatter: myFormatter,
      useHTML: true,
      backgroundColor: "black",
    },
    plotOptions: {
      spline: {
        marker: {
          enable: false,
        },
      },
    },
    series: [
      {
        data: seriesData,
      },
    ],
  };

  return chartOption;
};
const engagementHelper = { engagementMessageOverTimeChartOptions };

export default engagementHelper;
