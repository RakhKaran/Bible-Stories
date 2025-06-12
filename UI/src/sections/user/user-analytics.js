/* eslint-disable jsx-a11y/media-has-caption */
import { Box, Card, CardContent, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { useParams } from "react-router"
import axiosInstance from "src/utils/axios";
import { alpha, useTheme } from '@mui/material/styles';
import Iconify from "src/components/iconify";
import { _userAbout } from 'src/_mock';
import AnalyticsCurrentVisits from "../overview/analytics/analytics-current-visits";
import AnalyticsWebsiteVisits from "../overview/analytics/analytics-website-visits";
import ProfileCover from "./profile-cover";


export default function UserAnalytics() {
    const theme = useTheme();
    const params = useParams();
    const { userId } = params;
    const [analyticsData, setAnalyticsData] = useState();

    const analyticsFetchByUser = async (id) => {
        try {
            const response = await axiosInstance.get(`/analytics-by-userId/${id}`);
            if (response?.data?.success) {
                setAnalyticsData(response?.data?.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (userId) {
            analyticsFetchByUser(userId);
        }
    }, [userId])

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${Math.round(remainingSeconds)}s`;
    };

    const graphLabels = analyticsData?.analytics?.languageWiseData?.map((lang) => lang.langName);
    const userCounts = analyticsData?.analytics?.languageWiseData?.map((lang) => lang.usersCount);

    const pieChartData = analyticsData?.analytics?.languageWiseData?.map((lang) => ({
        label: lang.langName,
        value: lang.usersCount,
    }));

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };


    const handleLikedStories = () => {
        const columnNames = [
            { label: 'Title', key: 'title' },
            { label: 'Subtitle', key: 'subTitle' },
            { label: 'Date', key: 'dateTime' },
        ];

        const filteredTableData = [];

        // eslint-disable-next-line array-callback-return
        analyticsData?.analytics?.likedStories?.map((data) => {
            filteredTableData.push({
                title: data?.stories?.title,
                subTitle: data?.stories?.subTitle,
                dateTime: formatDate(data?.stories?.createdAt),
            })
        })

        const excelData = [
            columnNames.map((col) => col.label), // Add headers
            ...filteredTableData.map((row) => columnNames.map((col) => row[col.key])), // Map data to keys
        ];

        const fileName = `${analyticsData?.user?.firstName}-LikedStories.xlsx`;
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Coupon Master');
        XLSX.writeFile(wb, fileName);
    };

    const handleDownloadStories = () => {
        const columnNames = [
            { label: 'Title', key: 'title' },
            { label: 'Subtitle', key: 'subTitle' },
            { label: 'Date', key: 'dateTime' },
        ];

        const filteredTableData = [];

        // eslint-disable-next-line array-callback-return
        analyticsData?.analytics?.downloadedStories?.map((data) => {
            filteredTableData.push({
                title: data?.stories?.title,
                subTitle: data?.stories?.subTitle,
                dateTime: formatDate(data?.stories?.createdAt),
            })
        })

        const excelData = [
            columnNames.map((col) => col.label), // Add headers
            ...filteredTableData.map((row) => columnNames.map((col) => row[col.key])), // Map data to keys
        ];

        const fileName = `${analyticsData?.user?.firstName}-DownloadStories.xlsx`;
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Coupon Master');
        XLSX.writeFile(wb, fileName);
    };

    return (
        <Box component='div'>
            <Card
                sx={{
                    mb: 3,
                    height: 290,
                }}
            >
                <ProfileCover
                    role={_userAbout.role}
                    name={`${analyticsData?.user?.firstName} ${analyticsData?.user?.lastName || ''}`}
                    avatarUrl={analyticsData?.user?.avatar}
                    coverUrl={_userAbout.coverUrl}
                />
            </Card>
            <Stack spacing={3}>
                <Grid alignItems='center' container spacing={3}>
                    {/* Analytics Section */}
                    {/* Card for Total Listening Duration */}
                    <Grid item xs={12} sm={4}>
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
                                        {formatDuration(analyticsData?.analytics?.cumulativeListeningDuration)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Cards for Downloads and Likes (if needed) */}
                    {/* Card for Downloads */}
                    <Grid item xs={12} sm={4}>
                        <Card
                            sx={{
                                position: 'relative', // Enable absolute positioning inside
                                borderRadius: 2,
                                p: 3,
                                textAlign: "center",
                                boxShadow: 2,
                                height: "100%",
                                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.2)})`,
                                color: theme.palette.warning.darker,
                            }}
                        >
                            {/* Top-right icon */}
                            <IconButton
                                onClick={() => handleDownloadStories()}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    color: theme.palette.warning.main,
                                }}
                            >
                                <Iconify icon="eva:cloud-download-fill" width={24} height={24} />
                            </IconButton>

                            <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Stack direction="column" spacing={1} alignItems="center">
                                    <Iconify
                                        sx={{ color: "warning.main", width: '80px', height: '80px' }}
                                        icon="eva:cloud-download-fill"
                                    />
                                    <Typography variant="h6">Total Downloads</Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {analyticsData?.analytics?.downloadStoriesCount}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>


                    {/* Card for Likes */}
                    <Grid item xs={12} sm={4}>
                        <Card
                            sx={{
                                position: 'relative', // Enable absolute positioning inside
                                borderRadius: 2,
                                p: 3,
                                textAlign: "center",
                                boxShadow: 2,
                                height: "100%",
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.2)})`, // Success gradient for likes
                                color: theme.palette.success.darker,
                            }}
                        >
                            {/* Top-right icon */}
                            <IconButton
                                onClick={() => handleLikedStories()}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    color: theme.palette.warning.main,
                                }}
                            >
                                <Iconify icon="eva:cloud-download-fill" width={24} height={24} />
                            </IconButton>
                            <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Stack direction="column" spacing={1} alignItems="center">
                                    <Iconify
                                        sx={{ color: "success.main", width: '80px', height: '80px' }}
                                        icon="eva:heart-fill"
                                    />
                                    <Typography variant="h6">Total Likes</Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {analyticsData?.analytics?.likedStoriesCount} {/* Replace with actual likes data */}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Analytics Charts Section */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <AnalyticsWebsiteVisits
                            title="Stories Per Language"
                            chart={{
                                labels: graphLabels, // Language names as labels
                                series: [
                                    {
                                        name: 'Stories Count',
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
                                            text: 'Stories Count',
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
                            title="Language Wise Data"
                            chart={{
                                series: pieChartData || [],
                            }}
                        />
                    </Grid>
                </Grid>

                {analyticsData?.analytics?.audioHistory?.length > 0 && <Typography variant='h5'>Listened Stories</Typography>}
                <Grid container spacing={2}>
                    {analyticsData?.analytics?.audioHistory
                        ?.filter(item =>
                            item.stories?.audios?.some(audio => audio.language.langName === 'English')
                        )
                        .map((item, index) => {
                            const englishAudio = item.stories.audios.find(audio => audio.language.langName === 'English');
                            return (
                                <Grid item xs={12} md={4}>
                                    <Card
                                        key={index}
                                        sx={{
                                            width: "100%",
                                            borderRadius: 2,
                                            p: 2,
                                            boxShadow: 3,
                                            marginBottom: 3,
                                        }}
                                    >
                                        <CardContent>
                                            <Stack direction="column" spacing={2}>
                                                {/* Image */}
                                                {item?.stories?.images?.[0]?.fileUrl && (
                                                    <Box
                                                        component="img"
                                                        src={item.stories.images[0].fileUrl}
                                                        alt={item.stories.title}
                                                        sx={{
                                                            width: "100%",
                                                            height: "auto",
                                                            borderRadius: 2,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                )}

                                                {/* Title and Subtitle */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {item.stories.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {item.stories.subTitle}
                                                        </Typography>
                                                    </Box>
                                                    <Box textAlign="right">
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Audio Lang:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {englishAudio?.language?.langName}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {/* Audio Player */}
                                                {englishAudio?.audio?.fileUrl && (
                                                    <audio
                                                        controls
                                                        src={englishAudio.audio.fileUrl}
                                                        style={{ width: "100%" }}
                                                    />
                                                )}

                                                {/* Stats Section */}
                                                <Stack direction="column" justifyContent="space-between">
                                                    <Typography variant="body2">
                                                        Listening Count: <strong>{item.listeningCount}</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Cumulative Duration: <strong>{item.cumulativeListeningDuration} sec</strong>
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                </Grid>
            </Stack>
        </Box>
    )
}