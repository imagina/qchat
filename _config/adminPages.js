export default {
  chat: {
    //permission: 'iblog.posts.manage',
    activated: true,
    authenticated: true,
    path: '/chat',
    name: 'qchat.chat.index',
    page: () => import('@imagina/qchat/_pages/admin/chat'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ui.label.chat',
    icon: 'fas fa-comment-alt',
    subHeader: {
      refresh: true,
    }
  }
}
