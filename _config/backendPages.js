//Layout container
import master from 'src/layouts/master'
import blank from 'src/layouts/blank'

//Middleware
import auth from '@imagina/quser/_router/middlewares/auth'
import access from '@imagina/quser/_router/middlewares/access'

export default {
  messages: {
		permission: 'ichat.messages.index',
		activated: true,
		path: '/chat/messages',
		name: 'qchat.admin.messages.index',
		layout: require('@imagina/qchat/_layouts/admin/messages/index').default,
		containerLayout: master,
		title: 'qchat.sidebar.adminMessages',
		icon: 'far fa-comments',
		middleware: [auth,access]
	},
  conversation:{
    permission: null,
    activated: true,
    path: '/chat/conversation/:id',
    name: 'qchat.admin.conversation.show',
    layout: require('@imagina/qchat/_layouts/admin/messages/index').default,
    containerLayout: master,
    title: 'qchat.sidebar.adminMessages',
    icon: 'far fa-comments',
    middleware: [auth,access]
  },
}
