export default {
  conversations: {
    permission: 'ichat.conversations.manage',
    activated: true,
    path: '/ichat/conversations',
    name: 'qchat.admin.conversations',
    page: () => import('@imagina/qchat/_pages/main/conversations'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ichat.cms.sidebar.conversations',
    icon: 'far fa-comments',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  },
  providers: {
    permission: 'ichat.providers.manage',
    activated: true,
    path: '/ichat/providers',
    name: 'qchat.admin.providers',
    page: () => import('@imagina/qcrud/_pages/admin/crudPage'),
    crud: import('@imagina/qchat/_crud/providers'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ichat.cms.sidebar.providers',
    icon: 'fa fa-connectdevelop',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  }
}
