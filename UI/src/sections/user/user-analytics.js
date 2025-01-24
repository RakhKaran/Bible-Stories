// export default function UserAnalytics(){
//     return(
//         <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//         <CustomBreadcrumbs
//           heading="Profile"
//           links={[
//             { name: 'Dashboard', href: paths.dashboard.root },
//             { name: 'User', href: paths.dashboard.user.root },
//             { name: user?.displayName },
//           ]}
//           sx={{
//             mb: { xs: 3, md: 5 },
//           }}
//         />
  
//         <Card
//           sx={{
//             mb: 3,
//             height: 290,
//           }}
//         >
//           <ProfileCover
//             role={_userAbout.role}
//             name={user?.displayName}
//             avatarUrl={user?.photoURL}
//             coverUrl={_userAbout.coverUrl}
//           />
//         </Card>
//         </Container>
//     )
// }