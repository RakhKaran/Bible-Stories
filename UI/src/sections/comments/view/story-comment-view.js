import { Container, Grid } from "@mui/material";
import { useParams } from "react-router";
import { settings } from "nprogress";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import { paths } from "src/routes/paths";
import StoryCardView from "../story-view";
import CommentsView from "../comments-view";

// ------------------------------------------------------------------------------------------------------------------

export default function StoryCommentView(){
    const params = useParams();
    const {storyId} = params;

    return(
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
            heading="Stories Comments"
            links={[
                { name: 'Dashboard', href: paths.dashboard.root },
                { name: 'Story', href: paths.dashboard.story.list },
                { name: 'List' },
            ]}
            sx={{
                mb: { xs: 3, md: 5 },
            }}
            />
            <Grid container justifyContent='center' spacing='30px'>
                <Grid item xs={12} md={6} justifyContent='center'>
                    <StoryCardView storyId={Number(storyId)} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CommentsView storyId={Number(storyId)} />
                </Grid>
            </Grid>
        </Container>
    )
} 