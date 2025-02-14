import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  language: icon('ic_languages'),
  category: icon('ic_categories'),
  story: icon('ic_story'),
  question: icon('ic_conversations'),
  notification: icon('ic_notifications')
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      {
        subheader: t('Dashboard'),
        items: [
          // DASHBOARD
          { title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard },
          // USER
          {
            title: t('user'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: t('list'), path: paths.dashboard.user.list },
            ],
          },
          // LANGUAGE
          {
            title: t('language'),
            path: paths.dashboard.language.root,
            icon: ICONS.language,
            children: [
              { title: t('list'), path: paths.dashboard.language.list },
              { title: t('New Language'), path: paths.dashboard.language.new },
            ],
          },
          // CATEGORY
          {
            title: t('category'),
            path: paths.dashboard.category.root,
            icon: ICONS.category,
            children: [
              { title: t('list'), path: paths.dashboard.category.list },
              { title: t('New Category'), path: paths.dashboard.category.new },
            ],
          },
          // STORY
          {
            title: t('story'),
            path: paths.dashboard.story.root,
            icon: ICONS.story,
            children: [
              { title: t('list'), path: paths.dashboard.story.list },
              { title: t('New Story'), path: paths.dashboard.story.new },
            ],
          },
          // GENERAL QUESTION
          {
            title: t('general questions'),
            path: paths.dashboard.question.root,
            icon: ICONS.question,
            children: [
              { title: t('list'), path: paths.dashboard.question.list },
              { title: t('New question'), path: paths.dashboard.question.new },
            ],
          },
          // PUSH NOTIFICATIONS
          {
            title: t('push notifications'),
            path: paths.dashboard.pushNotification.root,
            icon: ICONS.notification,
            children: [
              { title: t('list'), path: paths.dashboard.pushNotification.list },
              { title: t('New notification'), path: paths.dashboard.pushNotification.new },
            ],
          }
        ],
      },
    ],
    [t]
  );

  return data;
}
