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

// Extended dummy data up to 10 entries
// const dummyData = [
//   {
//     usersId: 1,
//     totalListeningDuration: 15328, // in seconds
//     avatar: '{"url": "https://randomuser.me/api/portraits/men/1.jpg"}',
//     firstname: 'Karan Rakh',
//     email: null,
//     phonenumber: '+918788002033',
//   },
//   {
//     usersId: 2,
//     totalListeningDuration: 9823,
//     avatar: '{"url": "https://randomuser.me/api/portraits/women/2.jpg"}',
//     firstname: 'Listener2',
//     email: null,
//     phonenumber: '+919876543210',
//   },
//   {
//     usersId: 3,
//     totalListeningDuration: 4621,
//     avatar: '{"url": "https://randomuser.me/api/portraits/men/3.jpg"}',
//     firstname: 'Listener3',
//     email: null,
//     phonenumber: '+917654321987',
//   },
//   {
//     usersId: 4,
//     totalListeningDuration: 1528,
//     avatar: '{"url": "https://randomuser.me/api/portraits/men/4.jpg"}',
//     firstname: 'Listener4',
//     email: null,
//     phonenumber: '+918788002044',
//   },
//   {
//     usersId: 5,
//     totalListeningDuration: 9876,
//     avatar: '{"url": "https://randomuser.me/api/portraits/women/5.jpg"}',
//     firstname: 'Listener5',
//     email: null,
//     phonenumber: '+919123456789',
//   },
//   {
//     usersId: 6,
//     totalListeningDuration: 7412,
//     avatar: '{"url": "https://randomuser.me/api/portraits/men/6.jpg"}',
//     firstname: 'Listener6',
//     email: null,
//     phonenumber: '+918788002055',
//   },
//   {
//     usersId: 7,
//     totalListeningDuration: 5500,
//     avatar: '{"url": "https://randomuser.me/api/portraits/men/7.jpg"}',
//     firstname: 'Listener7',
//     email: null,
//     phonenumber: '+917788990099',
//   },
//   {
//     usersId: 8,
//     totalListeningDuration: 1045,
//     avatar: '{"url": "https://randomuser.me/api/portraits/women/8.jpg"}',
//     firstname: 'Listener8',
//     email: null,
//     phonenumber: '+918755445566',
//   },
//   {
//     usersId: 9,
//     totalListeningDuration: 8900,
//     avatar: '{"url": "https://randomuser.me/api/portraits/men/9.jpg"}',
//     firstname: 'Listener9',
//     email: null,
//     phonenumber: '+919123487654',
//   },
//   {
//     usersId: 10,
//     totalListeningDuration: 7000,
//     avatar: '{"url": "https://randomuser.me/api/portraits/women/10.jpg"}',
//     firstname: 'Listener10',
//     email: null,
//     phonenumber: '+917855664433',
//   },
// ];

// ----------------------------------------------------------------------

export default function AnalyticsTopListenersSummary({ data, setFiler, filter }) {
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
              startColor: alpha(theme.palette.primary.light, 0.2),
              endColor: alpha(theme.palette.primary.main, 0.2),
            }),
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            color: theme.palette.primary.darker,
            position: 'relative', // For absolute positioning of #1
            height: '100%'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              // background: theme.palette.primary.main,
              color: theme.palette.primary.darker,
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ opacity: 0.7, }} variant="h4">#1</Typography>
          </Box>
          <Avatar
            src={topListener.avatar.fileUrl || ''}
            alt={topListener.firstname}
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              border: `4px solid ${theme.palette.primary.main}`,
            }}
          />
          <Typography variant="h4">{topListener.firstname}</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>
            Total Listening Duration:
          </Typography>
          <Typography variant="h4">{formatDuration(topListener.totalListeningDuration)}</Typography>
        </Card>
      </Grid>

      {/* Other Listeners */}
      <Grid item xs={12} md={6}>
        <Box sx={{display : 'flex', alignItems : 'center', justifyContent : 'space-between', mb: 2,}}>
          <Typography variant="h6" sx={{  width:'60%' }}>
            Other Top Listeners
          </Typography>
          <Select
            value={filter} // Current filter value
            onChange={(e) => setFiler(e.target.value)} // Update the filter when user selects an option
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
                  <TableCell>{index + 2}</TableCell> {/* Start numbering from #2 */}
                  <TableCell>
                    <Avatar
                      src={listener.avatar.fileUrl || ''}
                      alt={listener.firstname}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>{listener.firstname || 'N/A'}</TableCell>
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

AnalyticsTopListenersSummary.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      usersId: PropTypes.number.isRequired,
      totalListeningDuration: PropTypes.number.isRequired, // Updated to number
      avatar: PropTypes.string.isRequired,
      firstname: PropTypes.string.isRequired,
      email: PropTypes.string,
      phonenumber: PropTypes.string,
    })
  ),
  setFiler: PropTypes.func,
  filter: PropTypes.string,
};
