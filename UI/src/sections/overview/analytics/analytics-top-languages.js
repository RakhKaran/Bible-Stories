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
  MenuItem,
  Select
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';

// Utility to format the total listening duration
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${Math.round(remainingSeconds)}s`;
};

// // Dummy data for testing
// const dummyData = [
//   {
//     language: 1,
//     totalListeningDuration: "1237",
//     langName: "English",
//     code: "en",
//     nativeLangName: "English"
//   },
//   {
//     language: 2,
//     totalListeningDuration: "1117",
//     langName: "Hindi",
//     code: "hi",
//     nativeLangName: "हिंदी"
//   }
// ];

// ----------------------------------------------------------------------

export default function AnalyticsTopLanguageSummary({ data, setFilter, filter }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return <Typography variant="h6">No data available</Typography>;
  }

  const topListener = data[0];
  const otherListeners = data.slice(1);

  return (
    <Grid container spacing={4}>
      {/* Top Listener */}
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
            color: theme.palette.primary.darker,
            position: 'relative',
            height: '100%',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              color: theme.palette.primary.darker,
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ opacity: 0.7 }} variant="h4">#1</Typography>
          </Box>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              border: `4px solid ${theme.palette.primary.main}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '24px',
              backgroundColor: theme.palette.primary.light,
            }}
          >
            {topListener.code}
          </Avatar>
          <Typography variant="h4">{topListener.langName} ({topListener.nativeLangName})</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>
            Total Listening Duration:
          </Typography>
          <Typography variant="h4">{formatDuration(topListener.totalListeningDuration)}</Typography>
        </Card>
      </Grid>

      {/* Other Listeners */}
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ width: '60%' }}>
            Other Top Languages
          </Typography>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </Box>
        <TableContainer component={Box} sx={{ maxHeight: 250, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {otherListeners.map((listener, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 2}</TableCell>
                  <TableCell>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: '16px',
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {listener.code}
                    </Avatar>
                  </TableCell>
                  <TableCell>{`${listener.langName} (${listener.nativeLangName})`|| 'N/A'}</TableCell>
                  <TableCell>{formatDuration(listener.totalListeningDuration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

AnalyticsTopLanguageSummary.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.number.isRequired,
      totalListeningDuration: PropTypes.string.isRequired,
      langName: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      nativeLangName: PropTypes.string.isRequired,
    })
  ),
  setFilter: PropTypes.func,
  filter: PropTypes.string,
};
