/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-nested-ternary */
// CommentsView.js
import { useEffect, useState, useRef } from "react";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";
import { mutate } from "swr";
import { useGetCommentsList } from "src/api/comments-api/comments";
import axiosInstance, { endpoints } from "src/utils/axios";
import { Card, CardContent, Stack, Typography, Avatar, CircularProgress, IconButton, MenuItem } from "@mui/material";
import Iconify from "src/components/iconify";
import CustomPopover, { usePopover } from "src/components/custom-popover";
import RepliesView from "./repliesView";

export default function CommentsView({ storyId }) {
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();
  const [commentsData, setCommentsData] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [visibleReplies, setVisibleReplies] = useState({}); // State to track visible replies
  const [popoverId, setPopoverId] = useState(undefined);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenPopover = (event, id) => {
    setAnchorEl(event.currentTarget);
    setPopoverId(id);
  }
  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverId(undefined);
  }

  const { comments, commentsCount, refreshComments } = useGetCommentsList(storyId, limit, skip);

  const containerRef = useRef(null);

  useEffect(() => {
    if (comments) {
      if (skip === 0) {
        setCommentsData(comments); // Set new comments when skip is 0
      } else {
        setCommentsData((prev) => [...prev, ...comments]); // Append new comments for pagination
      }
      setTotalComments(commentsCount);
      setHasMore(comments.length > 0); // Check if there are more comments
    }
    setIsLoading(false);
  }, [comments, commentsCount, skip]);  

  const handleScroll = () => {
    if (
      containerRef.current &&
      containerRef.current.scrollTop + containerRef.current.clientHeight >=
        containerRef.current.scrollHeight - 10
    ) {
      if (!isLoading && hasMore) {
        setSkip((prev) => prev + limit);
        setIsLoading(true);
        refreshComments();
      }
    }
  };

  const calculateWidth = (text) => {
    const baseWidth = 200; // Minimum width
    const additionalWidth = text ? text.length * 5 : 0; // Width based on text length
    return `${Math.min(baseWidth + additionalWidth, 450)}px`; // Limit max width
  };

  const handleViewReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Toggle the visibility of replies for the clicked comment
    }));
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await axiosInstance.delete(`/comment/${commentId}`);
      if (response?.data?.success) {
        setSkip(0);
        refreshComments(endpoints.comments.list(storyId, 0, 10)); 
        enqueueSnackbar("Comment Deleted", { variant: 'success' });
        handleClosePopover();
      }
    } catch (error) {
      console.error("Error while deleting comment", error);
    }
  };
  

  return (
    <Card sx={{ padding: 2, borderRadius: 3, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", marginBottom: 1 }}>
      <Typography sx={{ mb: 2 }} variant="h5">
        Comments
      </Typography>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          maxHeight: "500px", // Set height to make it scrollable
          overflowY: "auto",
        }}
      >
        <Stack direction="column" spacing={1}>
          {commentsData?.length > 0 ? (
            commentsData.map((comment, index) => (
              <Card key={comment.id} sx={{ marginBottom: 1, borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="start" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={comment?.users?.avatar?.fileUrl || ""} alt={comment?.users?.firstName || "Anonymous"} sx={{ width: 40, height: 40 }} />
                      <Typography variant="body1" fontWeight="bold">
                        {`${comment?.users?.firstName} ${comment?.users?.lastName ? comment?.users?.lastName : ''}` || "Anonymous"}
                      </Typography>
                    </Stack>
                    <IconButton color={popoverId === comment.id ? 'primary' : 'default'} onClick={(e) => handleOpenPopover(e, comment.id)}>
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </Stack>

                  {/* popover */}
                  <CustomPopover open={popoverId === comment.id} anchorEl={anchorEl} onClose={handleClosePopover} arrow="right-top" sx={{ width: 160 }}>
                    {/* <MenuItem onClick={() => { popover.onClose(); }}>Edit</MenuItem> */}
                    <MenuItem 
                      onClick={() => { 
                        handleDelete(comment.id);
                        handleClosePopover();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </CustomPopover>

                  {/* Comment Text or Audio */}
                  {comment?.commentType === "text" ? (
                    <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1, textAlign: "justify" }}>
                      {comment?.comment || "No comment provided."}
                    </Typography>
                  ) : comment?.commentType === "audio" && comment?.audio?.fileUrl ? (
                    <audio controls src={comment.audio.fileUrl} preload="metadata" style={{ marginTop: 8, width: "100%" }} />
                  ) : (
                    <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
                      Unsupported comment type.
                    </Typography>
                  )}

                  {/* Show replies if there are any */}
                  {comment?.repliesCount > 0 && (
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ marginTop: 1, cursor: "pointer" }}
                      onClick={() => handleViewReplies(comment.id)} // Toggle visibility of replies
                    >
                      View {comment.repliesCount} repl{comment.repliesCount > 1 ? "ies" : "y"}
                    </Typography>
                  )}

                  {/* Replies component, show only when clicked */}
                  {visibleReplies[comment.id] && comment?.repliesCount > 0 && (
                    <RepliesView commentId={comment?.id} />
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">No comments available.</Typography>
          )}
        </Stack>
        {isLoading && (
          <Stack alignItems="center" sx={{ marginTop: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        )}
      </div>
    </Card>
  );
}

CommentsView.propTypes = {
  storyId: PropTypes.number,
};
