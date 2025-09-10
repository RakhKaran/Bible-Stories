// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { _userList } from 'src/_mock';
import { useGetUserById} from 'src/api/users-api/users';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//

import { Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';

import Iconify from 'src/components/iconify';
import UserNewEditForm from '../user-new-edit-form';
import UserAccountChangePassword from '../User-account-change-password';



// ----------------------------------------------------------------------
const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  }
]
export default function UserEditView() {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const params = useParams();

  const { id } = params;

  const { user: currentUser } = useGetUserById(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'User',
            href: paths.dashboard.user.list,
          },
          {
            name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
          },
        ]}
          sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs 
      value={currentTab}
      onChange={handleChangeTab}
      >
        {TABS.map((tab)=>(
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
         {currentTab === 'general' && <UserNewEditForm currentUser={currentUser} /> }
          {
            currentTab === 'security' && <UserAccountChangePassword currentUser={currentUser} />
          }
      
    </Container>
  );
}
