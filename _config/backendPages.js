export default {
  messages: {
		permission: 'ichat.messages.index',
		activated: true,
		path: '/chat',
		name: 'qchat.admin.messages.index',
    page: () => import('@imagina/qchat/_pages/admin/index'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
		title: 'qchat.sidebar.adminMessages',
		icon: 'far fa-comments',
    authenticated: true
	},
  conversation:{
    permission: null,
    activated: true,
    path: '/chat/conversation/:id',
    name: 'qchat.admin.conversation.show',
    page: () => import('@imagina/qchat/_pages/admin/index'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qchat.sidebar.adminMessages',
    icon: 'far fa-comments',
    authenticated: true
  },

}
