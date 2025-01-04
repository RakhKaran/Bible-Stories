import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/auth/me',
    login: '/auth/admin-login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  // users api endpoints..
  users: {
    list: '/users',
    details: (userId) => `/users/${userId}`
  },
  // languages api endpoints..
  languages: {
    list: '/fetch-languages',
    details: (languageId) => `/fetch-languages/${languageId}`
  },
  // categories api endpoints..
  categories: {
    list: '/categories',
    details: (categoryId) => `/categories/${categoryId}`
  },
  // stories api endpoints..
  stories: {
    list: '/story-list',
    details: (storyId) => `/story-by-id-admin/${storyId}`
  },
  // stories questions api endpoints..
  storyQuestions: {
    list:(storyId) => `/story-question-list/${storyId}`,
    details: (questionId) => `/story-question-by-id-admin/${questionId}`
  },
  // general questions api endpoints..
  generalQuestions: {
    list:(storyId) => `/question-list`,
    details: (questionId) => `/question-by-id-admin/${questionId}`
  },
  // comments api endpoints..
  comments: {
    list: (storyId, limit, skip) => `/comments/${storyId}?limit=${limit}&skip=${skip}`,
    replyList: (commentId, limit, skip) => `/comment-replies/${commentId}?limit=${limit}&skip=${skip}`
  },
};
