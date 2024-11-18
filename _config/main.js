import {eventBus, store} from "../../../plugins/utils";

export default {
  moduleName: 'ichat',
  headerActions: async () => {
    return [
      //Chat
      {
        order: 2,
        name: 'chat',
        label: 'Chat',
        vIf: (config('app.mode') == 'iadmin') && store.hasAccess('ichat.conversations.index'),
        badgeName: 'chat',
        props: {
          icon: 'fa-light fa-message-lines',
          class: 'btn-small'
        },
        action: () => eventBus.emit('toggleMasterDrawer', 'chat')
      }
    ]
  }
}
