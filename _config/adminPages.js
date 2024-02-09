export default {
  conversations: {
    permission: 'ichat.conversations.manage',
    activated: true,
    path: '/ichat/conversations',
    name: 'qchat.admin.conversations',
    page: () => import('src/modules/qchat/_pages/main/conversations'),
    layout: () => import('src/modules/qsite/_layouts/master.vue'),
    title: 'ichat.cms.sidebar.conversations',
    icon: 'fa-light fa-messages',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  }
}
