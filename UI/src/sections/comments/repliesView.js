/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-nested-ternary */
// RepliesView.js
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import { Card, CardContent, Stack, Typography, Avatar, IconButton, MenuItem, CircularProgress, Box } from "@mui/material";
import Iconify from "src/components/iconify";
import CustomPopover, { usePopover } from "src/components/custom-popover";
import { useGetCommentRepliesList } from "src/api/comments-api/comments"; // Assuming you have an API for fetching replies
import axiosInstance from "src/utils/axios";

const RepliesView = ({ commentId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();
  const [repliesData, setRepliesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleReplies, setVisibleReplies] = useState({}); // State to track visible replies

  const { replies, repliesEmpty, refreshCommentsReplies } = useGetCommentRepliesList(commentId, 10, 0);

  useEffect(() => {
    if (replies && !repliesEmpty) {
      setRepliesData(replies); // Store replies data
    }
    setIsLoading(false);
  }, [replies, repliesEmpty]);

  const handleViewReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Toggle the visibility of replies for the clicked comment
    }));
  };

  const handleDeleteReply = async(replyId) => {
    try{
      const response = await axiosInstance.delete(`/comment/${replyId}`);
      if(response?.data?.success){
        enqueueSnackbar("Reply deleted", {variant : "success"});
        refreshCommentsReplies();
      }
    }catch(error){
      console.error("error while deleting reply", error);
    }
  }

  // Recursive function to render replies
  const renderReplies = (replies) => replies.map((reply, index) => (
      <Box key={index} sx={{ marginBottom: 1, borderRadius: 2, borderLeftStyle : 'dashed', pl:'8px', borderLeftColor: 'lightgray' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={reply?.users?.avatar?.fileUrl || ""}
                alt={reply?.users?.firstName || "Anonymous"}
                sx={{ width: 40, height: 40 }}
              />
              <Typography variant="body1" fontWeight="bold">
                {`${reply?.users?.firstName} ${reply?.users?.lastName ? reply?.users?.lastName : ''}` || "Anonymous"}
              </Typography>
            </Stack>
            <IconButton color={popover.open ? "primary" : "default"} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>

          <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 160 }}>
            <MenuItem 
              onClick={
                () => { 
                  handleDeleteReply(reply.id);
                  popover.onClose(); 
                  }
              }>
              Delete
            </MenuItem>
          </CustomPopover>

          {/* Comment Text or Audio */}
          {reply?.commentType === "text" ? (
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1, textAlign: "justify" }}>
              {reply?.comment || "No reply provided."}
            </Typography>
          ) : reply?.commentType === "audio" && reply?.audio?.fileUrl ? (
            <audio controls src={reply.audio.fileUrl} preload="metadata" style={{ marginTop: 8, width: "100%" }} />
          ) : (
            <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
              Unsupported comment type.
            </Typography>
          )}

          {/* Recursively render nested replies */}
          {reply?.repliesCount > 0 && (
            <Typography
                variant="body2"
                color="primary"
                sx={{ marginTop: 1, cursor: "pointer" }}
                onClick={() => handleViewReplies(reply.id)} // Toggle visibility of replies
            >
                View {reply.repliesCount} repl{reply.repliesCount > 1 ? "ies" : "y"}
            </Typography>
          )}

          {/* Replies component, show only when clicked */}
          {visibleReplies[reply.id] && reply?.repliesCount > 0 && (
            <RepliesView commentId={reply?.id} />
          )}
      </Box>
    ));

  return (
    <Card sx={{ marginTop: 2, border:'none' }}>
      <CardContent>
        {/* <Typography variant="h6">Replies ({repliesCount})</Typography> */}
        {isLoading ? (
          <CircularProgress size={24} />
        ) : repliesData.length > 0 ? (
          <Stack direction="column" spacing={1}>
            {renderReplies(repliesData)} {/* Call the recursive function */}
          </Stack>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No replies available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RepliesView;

RepliesView.propTypes = {
  commentId: PropTypes.number,
};
