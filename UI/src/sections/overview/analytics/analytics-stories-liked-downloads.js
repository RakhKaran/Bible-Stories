import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  ListItemText,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';
import Iconify from 'src/components/iconify';

export default function AnalyticsLikedAndDownloadSummary({ likedStoriesData, downloadStoriesData }) {
  const theme = useTheme();

  // Utility function to format the data
  const formatStory = (storyData, likes, downloads) => ({
    title: storyData.title,
    subTitle: storyData.subTitle,
    likes,
    downloads,
    images: storyData.images,
  });

  // // Dummy Data with Bible story titles and subtitles
  // const dummyLikedStories = [
  //   {
  //     story: {
  //       title: 'God\'s Creation',
  //       subTitle: 'The Miracle of Creation',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500939Z_audio_cover_image_1.jpeg' },
  //       ],
  //     },
  //     likeCount: 120,
  //   },
  //   {
  //     story: {
  //       title: 'Noah\'s Ark',
  //       subTitle: 'A Promise Fulfilled',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500939Z_audio_cover_image_1.jpeg' },
  //       ],
  //     },
  //     likeCount: 98,
  //   },
  //   {
  //     story: {
  //       title: 'The Exodus',
  //       subTitle: 'The Escape from Egypt',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500986Z_audio_cover_image_3.jpeg' },
  //       ],
  //     },
  //     likeCount: 75,
  //   },
  //   {
  //     story: {
  //       title: 'David and Goliath',
  //       subTitle: 'Faith Overcoming Fear',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500939Z_audio_cover_image_1.jpeg' },
  //       ],
  //     },
  //     likeCount: 60,
  //   },
  // ];

  // const dummyDownloadedStories = [
  //   {
  //     story: {
  //       title: 'The Birth of Jesus',
  //       subTitle: 'The Miracle of Birth',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500986Z_audio_cover_image_3.jpeg' },
  //       ],
  //     },
  //     downloadCount: 200,
  //   },
  //   {
  //     story: {
  //       title: 'The Last Supper',
  //       subTitle: 'The Final Meal',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500939Z_audio_cover_image_1.jpeg' },
  //       ],
  //     },
  //     downloadCount: 150,
  //   },
  //   {
  //     story: {
  //       title: 'The Crucifixion',
  //       subTitle: 'Sacrifice for Humanity',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500939Z_audio_cover_image_1.jpeg' },
  //       ],
  //     },
  //     downloadCount: 130,
  //   },
  //   {
  //     story: {
  //       title: 'The Resurrection',
  //       subTitle: 'Victory Over Death',
  //       images: [
  //         { fileUrl: 'http://localhost:3034/files/20241231T094500986Z_audio_cover_image_3.jpeg' },
  //       ],
  //     },
  //     downloadCount: 110,
  //   },
  // ];

  const likedStories = likedStoriesData.map(item => formatStory(item.story, item.likeCount, 0));
  const downloadedStories = downloadStoriesData.map(item => formatStory(item.story, 0, item.downloadCount));

  return (
    <Grid container spacing={4}>
      {/* Most Liked Stories Table */}
     {likedStories.length > 0 && 
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              ...bgGradient({
                direction: '135deg',
                startColor: alpha(theme.palette.primary.light, 0.2),
                endColor: alpha(theme.palette.primary.main, 0.2),
              }),
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              color: theme.palette.primary.darker,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Most Favourite Stories
            </Typography>
            <TableContainer
              component={Box}
              sx={{
                maxHeight: 250,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Likes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {likedStories.slice(0, 4).map((story, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          alt={story.title}
                          src={story.images[0]?.fileUrl}
                          variant="rounded"
                          sx={{ width: 64, height: 64, mr: 2 }}
                        />
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography noWrap color="inherit" variant="subtitle2">
                              {story.title}
                            </Typography>
                          }
                          secondary={
                            <Typography noWrap color="inherit" variant="body2" sx={{ color: 'text.disabled' }}>
                              {story.subTitle}
                            </Typography>
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {story.likes}
                          <Iconify sx={{ color: 'primary.main' }} width={24} icon="eva:heart-fill" />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
     }

      {/* Most Downloaded Stories Table */}
      {downloadedStories.length > 0 &&
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              ...bgGradient({
                direction: '135deg',
                startColor: alpha(theme.palette.secondary.light, 0.2),
                endColor: alpha(theme.palette.secondary.main, 0.2),
              }),
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              color: theme.palette.secondary.darker,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Most Downloaded Stories
            </Typography>
            <TableContainer
              component={Box}
              sx={{
                maxHeight: 250,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Downloads</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {downloadedStories.slice(0, 4).map((story, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          alt={story.title}
                          src={story.images[0]?.fileUrl}
                          variant="rounded"
                          sx={{ width: 64, height: 64, mr: 2 }}
                        />
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography noWrap color="inherit" variant="subtitle2">
                              {story.title}
                            </Typography>
                          }
                          secondary={
                            <Typography noWrap color="inherit" variant="body2" sx={{ color: 'text.disabled' }}>
                              {story.subTitle}
                            </Typography>
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {story.downloads}
                          <Iconify sx={{ color: 'primary.main' }} width={24} icon="eva:download-fill" />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      }
    </Grid>
  );
}

AnalyticsLikedAndDownloadSummary.propTypes = {
  likedStoriesData: PropTypes.arrayOf(
    PropTypes.shape({
      storyId: PropTypes.number.isRequired,
      likeCount: PropTypes.number.isRequired,
      story: PropTypes.shape({
        title: PropTypes.string.isRequired,
        subTitle: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(
          PropTypes.shape({
            fileName: PropTypes.string.isRequired,
            fileUrl: PropTypes.string.isRequired,
            preview: PropTypes.string.isRequired,
          })
        ),
        categoryId: PropTypes.number.isRequired,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
      }),
    })
  ),
  downloadStoriesData: PropTypes.arrayOf(
    PropTypes.shape({
      storyId: PropTypes.number.isRequired,
      downloadCount: PropTypes.number.isRequired,
      story: PropTypes.shape({
        title: PropTypes.string.isRequired,
        subTitle: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(
          PropTypes.shape({
            fileName: PropTypes.string.isRequired,
            fileUrl: PropTypes.string.isRequired,
            preview: PropTypes.string.isRequired,
          })
        ),
        categoryId: PropTypes.number.isRequired,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
      }),
    })
  ),
};
