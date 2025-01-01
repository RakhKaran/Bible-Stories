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
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [
          { title: t('app'), path: paths.dashboard.root, icon: ICONS.dashboard },
          { title: t('ecommerce'), path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
          { title: t('analytics'), path: paths.dashboard.general.analytics, icon: ICONS.analytics },
          { title: t('banking'), path: paths.dashboard.general.banking, icon: ICONS.banking },
          { title: t('booking'), path: paths.dashboard.general.booking, icon: ICONS.booking },
          { title: t('file'), path: paths.dashboard.general.file, icon: ICONS.file },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
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
              { title: t('New Category'), path: paths.dashboard.story.new },
            ],
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
