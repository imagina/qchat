const pages = config('pages') // Get Pages from config

//Ichat
export default [
  {
    title: 'ichat.cms.sidebar.group',
    icon: 'far fa-comments',
    children: [
      pages.qchat.conversations,
      pages.qchat.providers
    ]
  }
]
