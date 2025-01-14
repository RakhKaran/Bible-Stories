import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// _mock
// import {
//   _analyticTasks,
//   _analyticPosts,
//   _analyticTraffic,
//   _analyticOrderTimeline,
// } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import axiosInstance from 'src/utils/axios';
//
// import AnalyticsNews from '../analytics-news';
// import AnalyticsTasks from '../analytics-tasks';
import AnalyticsCurrentVisits from '../analytics-current-visits';
// import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsWebsiteVisits from '../analytics-website-visits';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTopListenersSummary from '../anayltics-top-listners';
import AnalyticsLikedAndDownloadSummary from '../analytics-stories-liked-downloads';
// import AnalyticsTrafficBySite from '../analytics-traffic-by-site';
// import AnalyticsCurrentSubject from '../analytics-current-subject';
// import AnalyticsConversionRates from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const [blockData, setBlockData] = useState();
  const [topListenersData, setTopListenersData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [likedStoriesData, setLikedStoriesData] = useState([]);
  const [downloadStoriesData, setDownloadStoriesData] = useState([]);

  const fetchBlockData = async() => {
    try{
      const response = await axiosInstance.get('/analytics-blocks');

      if(response?.data?.success){
        setBlockData(response?.data?.data);
      }
    }catch(error){
      console.error(error);
    }
  }

  const fetchTopListners = async(timePeriod) => {
    try{
      const response = await axiosInstance.get(`/top-listeners?timePeriod=${timePeriod}`);

      if(response?.data?.success){
        setTopListenersData(response?.data?.data);
      }
    }catch(error){
      console.error(error);
    }
  }

  const fetchMostLikedStories = async() => {
    try{
      const response = await axiosInstance.get('/most-liked-stories');

      if(response?.data?.success){
        setLikedStoriesData(response?.data?.data);
      }
    }catch(error){
      console.error(error);
    }
  }

  const fetchMostDownloadStories = async() => {
    try{
      const response = await axiosInstance.get('/most-download-stories');

      if(response?.data?.success){
        setDownloadStoriesData(response?.data?.data);
      }
    }catch(error){
      console.error(error);
    }
  }

  useEffect(() => {
    fetchBlockData();
    fetchMostLikedStories();
    fetchMostDownloadStories();
  },[])

  useEffect(() => {
      fetchTopListners(filter);
  },[filter])

  console.log('blockData', blockData);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            onClick={() => navigate('user/list')}
            title="Users"
            total={blockData?.usersCount}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Guest Users"
            total={blockData?.guestUsersCount}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_guest_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            onClick={() => navigate('story/list')}
            title="Stories"
            total={blockData?.storiesCount}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_stories.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            onClick={() => navigate('language/list')}
            title="Languages"
            total={blockData?.languageCount}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_language.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Website Visits"
            subheader="(+43%) than last year"
            chart={{
              labels: [
                '01/01/2003',
                '02/01/2003',
                '03/01/2003',
                '04/01/2003',
                '05/01/2003',
                '06/01/2003',
                '07/01/2003',
                '08/01/2003',
                '09/01/2003',
                '10/01/2003',
                '11/01/2003',
              ],
              series: [
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Current Visits"
            chart={{
              series: [
                { label: 'America', value: 4344 },
                { label: 'Asia', value: 5435 },
                { label: 'Europe', value: 1443 },
                { label: 'Africa', value: 4443 },
              ],
            }}
          />
        </Grid>

        {topListenersData.length > 0 && 
          <Grid xs={12} md={12} lg={12}>
            <AnalyticsTopListenersSummary data={topListenersData} filter={filter} setFiler={setFilter}/>
          </Grid>
        }

        {(likedStoriesData.length > 0 || downloadStoriesData.length > 0) &&
          <Grid xs={12} md={12} lg={12}>
            <AnalyticsLikedAndDownloadSummary likedStoriesData={likedStoriesData} downloadStoriesData={downloadStoriesData}/>
          </Grid>
        }

        {/* <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Conversion Rates"
            subheader="(+43%) than last year"
            chart={{
              series: [
                { label: 'Italy', value: 400 },
                { label: 'Japan', value: 430 },
                { label: 'China', value: 448 },
                { label: 'Canada', value: 470 },
                { label: 'France', value: 540 },
                { label: 'Germany', value: 580 },
                { label: 'South Korea', value: 690 },
                { label: 'Netherlands', value: 1100 },
                { label: 'United States', value: 1200 },
                { label: 'United Kingdom', value: 1380 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title="Current Subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsNews title="News" list={_analyticPosts} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title="Order Timeline" list={_analyticOrderTimeline} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite title="Traffic by Site" list={_analyticTraffic} />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsTasks title="Tasks" list={_analyticTasks} />
        </Grid> */}
      </Grid>
    </Container>
  );
}
