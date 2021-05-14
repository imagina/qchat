<template>
  <div id="chatPage">
    Loading : {{ loading }} | Current User Id : {{ chatProps.currentUserId }}
    <q-separator class="q-my-md"/>


    <chat-window v-bind="chatProps" @fetch-messages="getMessages" @send-message="sendMessage" @add-room="createRoom">
    </chat-window>
  </div>
</template>
<script>
//Components
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'

export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
    this.$eventBus.$off('inotification.chat.message')
  },
  props: {},
  components: {ChatWindow},
  watch: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      conversations: [],
      conversationMessages: [],
      loading: {
        rooms: false,
        messages: false,
      },

    }
  },
  computed: {
    //Chat props
    chatProps() {
      return {
        currentUserId: this.$store.state.quserAuth.userId,
        rooms: this.rooms,
        loadingRooms: this.loading.rooms,
        roomsLoaded: !this.loading.rooms,
        messages: this.messages,
        loadingMessages: this.loading.messages,
        messagesLoaded: !this.loading.messages
      }
    },
    //Rooms
    rooms() {
      let rooms = []//Response
      let conversations = this.$clone(this.conversations)

      //Order room
      conversations.forEach(conversation => {
        //Instance roorm
        let room = {
          roomId: conversation.id,
          roomName: `ID ${conversation.id} | ${conversation.users[0].fullName}`,
          avatar: conversation.users[0].mainImage,
          users: [
            {
              _id: conversation.users[0].id,
              username: conversation.users[0].fullName,
              avatar: conversation.users[0].mainImage,
            },
            {
              _id: conversation.users[1].id,
              username: conversation.users[1].fullName,
              avatar: conversation.users[1].mainImage,
            },
          ]
        }

        //Push room
        rooms.push(room)
      })


      //Response
      return this.$clone(rooms)
    },
    //Messages
    messages() {
      let messages = []//Response
      let conversationMessages = this.$clone(this.conversationMessages).reverse()

      //Order room
      conversationMessages.forEach(messageData => {
        //Instance roorm
        let message = {
          _id: messageData.id,
          content: messageData.body,
          senderId: messageData.user.id,
          username: messageData.user.fullName,
          avatar: messageData.user.mainImage,
          date: this.$trd(messageData.createdAt),
          timestamp: this.$trd(messageData.createdAt, {type: 'time'}),
          system: false,
          saved: true,
          seen: true,
        }

        //Push room
        messages.push(message)
      })


      //Response
      return this.$clone(messages)
    }
  },
  methods: {
    init() {
      this.listenEvents()
      this.getRooms()
    },
    //Listen pusher message
    listenEvents() {
      //Refresh page
      this.$root.$on('page.data.refresh', () => {
        this.getRooms(true)
      })
      //New message from pusher
      this.$eventBus.$on('inotification.chat.message', (response) => {
        if (response.data) this.pushMessage(response.data)
      })
    },
    //Get rooms
    getRooms(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading.rooms = true
        this.conversations = []//Reset conversation
        this.conversationMessages = []//Reset conversation messages

        //Request Params
        let requestParams = {refresh: true}

        //Reques
        this.$crud.index('apiRoutes.qchat.conversations', requestParams).then(response => {
          this.conversations = response.data
          this.loading.rooms = false
          resolve(response.data)
        }).catch(error => {
          this.loading.rooms = false
          resolve(error)
        })
      })
    },
    //Get messages
    getMessages({room, options}) {
      return new Promise((resolve, reject) => {
        this.conversationMessages = []//Reset conversation messages
        this.loading.messages = true
        //Request params
        let requestParams = {
          refresh: true,
          params: {
            page: 1,
            take: 10,
            filter: {conversationId: room.roomId}
          }
        }
        //Request
        this.$crud.index('apiRoutes.qchat.messages', requestParams).then(response => {
          this.conversationMessages = response.data
          this.loading.messages = false
          resolve(response.data)
        }).catch(error => {
          this.loading.messages = false
          resolve(error)
        })
      })
    },
    //Send message
    sendMessage({content, roomId, file, replyMessage}) {
      return new Promise((resolve, reject) => {
        if (content.length) {
          //Request data
          let requestData = {
            conversationId: roomId,
            body: content,
            userId: this.$store.state.quserAuth.userId
          }
          //Request
          this.$crud.create('apiRoutes.qchat.messages', requestData)
          //push Message
          this.pushMessage({body: content})
        }
      })
    },
    //Push new message
    pushMessage(message) {
      //Set local message
      this.conversationMessages.unshift({
        id: this.$uid(),
        user: this.$store.state.quserAuth.userData,
        createdAt: this.$moment().format(),
        ...message
      })
    },
    //Create conversation
    createRoom(userId) {
      return console.warn('New Room')
      return new Promise(resolve => {
        let existConversation = false//To know if conversation already exist
        let usersIds = [userId, this.$store.state.quserAuth.userId]//Users to conversation
        this.search.userId = null //Reset search selection

        //Validate if conversation already exist
        this.conversationsList.forEach(conversation => {
          let cUsersId = conversation.users.map(user => user.id)
          if ((cUsersId.indexOf(usersIds[0]) != -1) && (cUsersId.indexOf(usersIds[1]) != -1))
            existConversation = conversation
        })

        //Open conversation
        if (existConversation) {
          this.openChat(existConversation)
        } else {//Create conversation
          this.conversations.loading = true
          //Request
          this.$crud.create('apiRoutes.qchat.conversations', {users: usersIds}).then(async response => {
            this.conversations.list.push(response.data)//Set conversation to list
            this.openChat(this.conversationsList.find(item => item.id == response.data.id))//Open conversation
            this.conversations.loading = false
          }).catch(error => {
            this.conversations.loading = false
          })
        }
      })
    },
  }
}
</script>
<style lang="stylus">
</style>
