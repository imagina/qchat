export default {
  conversations: {
    permission: 'ichat.conversations.manage',
    activated: true,
    path: '/ichat/conversations',
    name: 'qchat.admin.conversations',
    page: () => import('modules/qchat/_pages/main/conversations'),
    layout: () => import('layouts/master.vue'),
    title: 'ichat.cms.sidebar.conversations',
    icon: 'fa-light fa-messages',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  }
}
