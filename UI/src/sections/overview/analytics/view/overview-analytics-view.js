/* eslint-disable no-useless-catch */
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
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import AnalyticsCurrentVisits from '../analytics-current-visits';
// import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsWebsiteVisits from '../analytics-website-visits';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTopListenersSummary from '../anayltics-top-listners';
import AnalyticsLikedAndDownloadSummary from '../analytics-stories-liked-downloads';
import AnalyticsTopStoriesSummary from '../analytics-top-stories';
import AnalyticsTopLanguageSummary from '../analytics-top-languages';
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
  const [storyFilter, setStoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [likedStoriesData, setLikedStoriesData] = useState([]);
  const [downloadStoriesData, setDownloadStoriesData] = useState([]);
  const [topStoriesData, setTopStoriesData] = useState([]);
  const [topLanguagesData, setTopLanguagesData] = useState([]);
  const [monthWiseUserData, setMonthWiseUserData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const fetchTopStories = async(timePeriod) => {
    try{
      const response = await axiosInstance.get(`/top-stories?timePeriod=${timePeriod}`);

      if(response?.data?.success){
        setTopStoriesData(response?.data?.data);
      }
    }catch(error){
      console.error(error);
    }
  }

  const fetchTopLanguages = async(timePeriod) => {
    try{
      const response = await axiosInstance.get(`/top-languages?timePeriod=${timePeriod}`);

      if(response?.data?.success){
        setTopLanguagesData(response?.data?.data);
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

  const fetchUserAnalytics = async() => {
    try{
      const response = await axiosInstance.get('/users-analytics');

      if(response?.data?.success){
        setMonthWiseUserData(response?.data?.data);
      }
    }catch(error){
      throw error;
    }
  }

  useEffect(() => {
    fetchBlockData();
    fetchMostLikedStories();
    fetchMostDownloadStories();
    fetchUserAnalytics();
  },[])

  useEffect(() => {
      fetchTopListners(filter);
  },[filter])

  useEffect(() => {
    fetchTopStories(storyFilter);
  },[storyFilter])

  useEffect(() => {
    fetchTopLanguages(languageFilter);
  },[languageFilter])

  const filterDataByYear = (year) => monthWiseUserData.filter((data) => data.year === year);

  const generateChartData = () => {
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1); // Create an array for months 1 to 12
    const dataForYear = filterDataByYear(selectedYear);

    const monthlyUserCount = allMonths.map((month) => {
      const data = dataForYear.find((item) => item.month === month);
      return data ? data.totalVisits : 0; // If no data, return 0
    });

    const returningUsers = allMonths.map((month) => {
      const data = dataForYear.find((item) => item.month === month);
      return data ? data.returningUsers : 0;
    });

    const newUsers = allMonths.map((month) => {
      const data = dataForYear.find((item) => item.month === month);
      return data ? data.newUsers : 0;
    });

    return {
      labels: allMonths.map((month) => `${month < 10 ? `0${month}` : month}/01/${selectedYear}`), // Format labels as MM/01/YYYY
      series: [
        { name: 'Total Visits', type: 'column', fill: 'solid', data: monthlyUserCount },
        { name: 'Returning Users', type: 'area', fill: 'gradient', data: returningUsers },
        { name: 'New Users', type: 'line', fill: 'solid', data: newUsers },
      ],
    };
  };

  // Handle year change
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

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

        {topStoriesData.length > 0 &&
          <Grid xs={12} md={12} lg={12}>
            <AnalyticsTopStoriesSummary data={topStoriesData} filter={storyFilter} setFilter={setStoryFilter}/>
          </Grid>
        }

        {/* Year Dropdown */}
        <div style={{width : '100%', display : 'flex', alignItems : 'center', justifyContent: 'flex-end', gap: '10px', marginTop:'10px'}}>
          <Typography>Select Year: </Typography>
          <Select value={selectedYear} onChange={handleYearChange}>
            {/* Populate year options dynamically */}
            {Array.from(new Set(monthWiseUserData.map((data) => data.year))).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Analytics Chart */}
        <Grid xs={12} md={12} lg={12}>
          <AnalyticsWebsiteVisits
            title="App Visits"
            chart={generateChartData()}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={4}>
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
        </Grid> */}

        {topListenersData.length > 0 && 
          <Grid xs={12} md={12} lg={12}>
            <AnalyticsTopListenersSummary data={topListenersData} filter={filter} setFilter={setFilter}/>
          </Grid>
        }

        {(likedStoriesData.length > 0 || downloadStoriesData.length > 0) &&
          <Grid xs={12} md={12} lg={12}>
            <AnalyticsLikedAndDownloadSummary likedStoriesData={likedStoriesData} downloadStoriesData={downloadStoriesData}/>
          </Grid>
        }

        {(topLanguagesData.length > 0) &&
          <Grid xs={12} md={12} lg={12}>
            <AnalyticsTopLanguageSummary data={topLanguagesData}  filter={languageFilter} setFilter={setLanguageFilter}/>
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
