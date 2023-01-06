import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import engagementHelper from "./EngagementHelper";
import { messageCountList, channels } from "./miscData";

import BrandDark from 'highcharts/themes/brand-dark';
BrandDark(Highcharts);


const EngagementMessagesOverTime = ()=>{
  const options = engagementHelper.engagementMessageOverTimeChartOptions(messageCountList, channels)

	return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default EngagementMessagesOverTime