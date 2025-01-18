/* eslint-disable jsx-a11y/media-has-caption */
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router"
import axiosInstance from "src/utils/axios";
import { alpha, useTheme } from '@mui/material/styles';
import Iconify from "src/components/iconify";
import AnalyticsCurrentVisits from "../overview/analytics/analytics-current-visits";
import AnalyticsWebsiteVisits from "../overview/analytics/analytics-website-visits";

export default function StoryAnalytics() {
    const theme = useTheme();
    const params = useParams();
    const { storyId } = params;
    const [ analyticsData, setAnalyticsData ] = useState();

    const analyticsFetchByStory = async (id) => {
        try{
            const response = await axiosInstance.get(`/analytics-by-storyId/${id}`);
            if(response?.data?.success){
                setAnalyticsData(response?.data?.data);
            }
        }catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
        if(storyId){
            analyticsFetchByStory(storyId);
        }
    },[storyId])

    console.log(analyticsData);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
      
        return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${Math.round(remainingSeconds)}s`;
      };

    const graphLabels = analyticsData?.languageWiseData?.map((lang) => lang.langName);
    const userCounts = analyticsData?.languageWiseData?.map((lang) => lang.usersCount);

    const pieChartData = analyticsData?.languageWiseData?.map((lang) => ({
        label: lang.langName,
        value: lang.usersCount,
      }));
    
    // const graphLabels = [
    //     'English', 'Hindi', 'Spanish', 'French', 'German', 
    //     'Chinese', 'Arabic', 'Russian', 'Portuguese', 'Japanese', 
    //     'Italian', 'Korean'
    //   ];
      
    //   const userCounts = [120, 80, 95, 130, 110, 140, 60, 85, 100, 90, 75, 65];
      
    //   const pieChartData = [
    //     { label: 'English', value: 120 },
    //     { label: 'Hindi', value: 80 },
    //     { label: 'Spanish', value: 95 },
    //     { label: 'French', value: 130 },
    //     { label: 'German', value: 110 },
    //     { label: 'Chinese', value: 140 },
    //     { label: 'Arabic', value: 60 },
    //     { label: 'Russian', value: 85 },
    //     { label: 'Portuguese', value: 100 },
    //     { label: 'Japanese', value: 90 },
    //     { label: 'Italian', value: 75 },
    //     { label: 'Korean', value: 65},
    //   ]

    return(
        <Box component='div'>
    <Stack spacing={3}>
        <Grid alignItems='center' container spacing={3}>
            {/* Story Information Section */}
            <Grid item xs={12} md={6}>
                <Card
                    sx={{
                        width: "100%",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 3,
                        margin: "auto",
                    }}
                >
                    <CardContent>
                        <Stack direction="column" spacing={3}>
                            {/* Image Section */}
                            {analyticsData?.storyData?.images?.[0]?.fileUrl && (
                                <Box
                                    component="img"
                                    src={analyticsData.storyData.images[0].fileUrl}
                                    alt={analyticsData?.storyData?.title || "Story Image"}
                                    sx={{
                                        width: "100%",
                                        height: "auto",
                                        borderRadius: 2,
                                        objectFit: "cover",
                                    }}
                                />
                            )}

                            {/* Title and Subtitle Section */}
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                <Stack direction="column" spacing={0.5}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                        {analyticsData?.storyData?.title || "Untitled"}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {analyticsData?.storyData?.subTitle || "No subtitle available"}
                                    </Typography>
                                </Stack>

                                {/* Audio Language Section */}
                                {analyticsData?.storyData?.audios?.[0]?.language?.langName && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" fontWeight="bold">
                                            Audio:
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {analyticsData.storyData.audios[0].language.langName}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>

                            {/* Category Section */}
                            <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                                {analyticsData?.storyData?.category?.categoryName || "Category: Old Testament"}
                            </Typography>

                            {/* Audio Player Section */}
                            {analyticsData?.storyData?.audios?.[0]?.audio?.fileUrl && (
                                <audio
                                    style={{ width: "100%" }}
                                    controls
                                    src={analyticsData.storyData.audios[0].audio.fileUrl}
                                    preload="metadata"
                                />
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
            {/* Analytics Section */}
            <Grid item xs={12} md={6} alignItems="center">
                <Stack direction="column" spacing={2}>
                    {/* Row for Total Listening Duration and Total Users */}
                    <Grid container spacing={2}>
                        {/* Card for Total Listening Duration */}
                        <Grid item xs={12} sm={6}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    boxShadow: 2,
                                    height: "100%",
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.2)})`, // Green gradient
                                    color: theme.palette.success.darker,
                                }}
                            >
                                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Stack direction="column" spacing={1} alignItems="center">
                                        <Iconify
                                            sx={{ color: "success.main", width: '80px', height: '80px' }}
                                            icon="eva:headphones-fill"
                                        />
                                        <Typography variant="h6">Total Listening Duration</Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {formatDuration(analyticsData?.cumulativeListeningDuration)}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Card for Total Users */}
                        <Grid item xs={12} sm={6}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    boxShadow: 2,
                                    height: "100%",
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.primary.main, 0.2)})`, // Primary gradient
                                    color: theme.palette.primary.darker,
                                }}
                            >
                                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Stack direction="column" spacing={1} alignItems="center">
                                        <Iconify
                                            sx={{ color: "primary.main", width: '80px', height: '80px' }}
                                            icon="eva:people-fill"
                                        />
                                        <Typography variant="h6">Total Users</Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {analyticsData?.usersCount}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Cards for Downloads and Likes (if needed) */}
                    <Grid container spacing={2}>
                        {/* Card for Downloads */}
                        <Grid item xs={12} sm={6}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    boxShadow: 2,
                                    height: "100%",
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.2)})`, // Warning gradient for downloads
                                    color: theme.palette.warning.darker,
                                }}
                            >
                                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Stack direction="column" spacing={1} alignItems="center">
                                        <Iconify
                                            sx={{ color: "warning.main", width: '80px', height: '80px' }}
                                            icon="eva:cloud-download-fill"
                                        />
                                        <Typography variant="h6">Total Downloads</Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {analyticsData?.downloadCount} {/* Replace with actual download data */}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Card for Likes */}
                        <Grid item xs={12} sm={6}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    boxShadow: 2,
                                    height: "100%",
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.2)})`, // Success gradient for likes
                                    color: theme.palette.success.darker,
                                }}
                            >
                                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Stack direction="column" spacing={1} alignItems="center">
                                        <Iconify
                                            sx={{ color: "success.main", width: '80px', height: '80px' }}
                                            icon="eva:heart-fill"
                                        />
                                        <Typography variant="h6">Total Likes</Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                        {analyticsData?.likes} {/* Replace with actual likes data */}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Stack>
            </Grid>



        </Grid>

        {/* Analytics Charts Section */}
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <AnalyticsWebsiteVisits
                    title="Users Per Language"
                    chart={{
                        labels: graphLabels, // Language names as labels
                        series: [
                            {
                                name: 'Users Count',
                                type: 'bar',
                                fill: 'solid',
                                data: userCounts,
                            },
                        ],
                        options: {
                            chart: {
                                toolbar: { show: false },
                            },
                            xaxis: {
                                categories: graphLabels,
                                title: {
                                    text: 'Languages',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    },
                                },
                            },
                            yaxis: {
                                title: {
                                    text: 'Users Count',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    },
                                },
                            },
                            colors: ['#1f77b4'],
                            dataLabels: {
                                enabled: true,
                            },
                        },
                    }}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <AnalyticsCurrentVisits
                    title="Current Visits"
                    chart={{
                        series: pieChartData || [],
                    }}
                />
            </Grid>
        </Grid>
    </Stack>
</Box>
    )
}