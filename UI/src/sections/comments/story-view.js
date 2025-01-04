/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axiosInstance, { endpoints } from "src/utils/axios";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import { useResponsive } from "src/hooks/use-responsive";

export default function StoryCardView({ storyId }) {
  const [currentStory, setCurrentStory] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useResponsive('md', 'up')

  // Fetch story by ID
  const fetchStoryById = async (id) => {
    try {
      const response = await axiosInstance.get(endpoints.stories.details(id));
      if (response?.data?.success) {
        setCurrentStory(response?.data?.data);
      } else {
        setError("Failed to fetch story details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching story details.");
    }
  };

  // Fetch story on storyId change
  useEffect(() => {
    if (storyId) {
      fetchStoryById(Number(storyId));
    }
  }, [storyId]);

  if (error) {
    return (
      <Typography variant="body1" color="error">
        {error}
      </Typography>
    );
  }

  if (!currentStory) {
    return (
      <Typography variant="body1" color="textSecondary">
        Loading story details...
      </Typography>
    );
  }

  return (
    <Card
      sx={{
        width: !isMobile ? "100%" : "90%",
        borderRadius: 2,
        p: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Stack direction="column" spacing={2}>
          {/* Image Section */}
          {currentStory?.images?.[0]?.fileUrl && (
            <Box
              component="img"
              src={currentStory.images[0].fileUrl}
              alt={currentStory?.title || "Story Image"}
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 1,
                objectFit: "cover",
              }}
            />
          )}

          {/* Title and Subtitle Section */}
          <Stack direction="row" alignItems='start' justifyContent="space-between">
            <Stack direction="column" spacing={0.5}>
              <Typography variant="subtitle1" fontWeight="bold">
                {currentStory?.title || "Untitled"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentStory?.subTitle || "No subtitle available"}
              </Typography>
            </Stack>

            {/* Audio Language Section */}
            {currentStory?.audios?.[0]?.language?.langName && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight="bold">
                  Audio:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentStory.audios[0].language.langName}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Category Section */}
          <Typography variant="body2" color="textSecondary">
            {currentStory?.category?.categoryName || "Category: Old Testament"}
          </Typography>

          {/* Audio Player Section */}
          {currentStory?.audios?.[0]?.audio?.fileUrl && (
            <audio style={{width:'100%'}} controls src={currentStory.audios[0].audio.fileUrl} preload="metadata" />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

StoryCardView.propTypes = {
  storyId: PropTypes.number.isRequired,
};
