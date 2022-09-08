<template>
  <div id="advanceChatComponent">
    <div id="advanceChatComponentContent" class="relative-position">
      <!--Chat component-->
      <chat-window id="vueAdvanceChat" v-bind="chatProps" @fetch-messages="getMessages" @send-message="sendMessage"
                   @add-room="modalNewRoom.show = true" @menu-action-handler="menuActionHandler"
                   @open-file="({message}) => $helper.openExternalURL(message.file.url, true)"/>
      <!--Dialog to new room-->
      <master-modal v-model="modalNewRoom.show" :loading="modalNewRoom.loading"
                    :title="`${$tr('isite.cms.label.new')} ${$tr('isite.cms.label.chat')}`">
        <div>
          <!-- Type -->
          <dynamic-field v-model="newRoom.type" :field="fieldsToNewRooms.type"/>
          <!-- Form Type -->
          <dynamic-form v-model="newRoom.form" v-if="fieldsToNewRooms.blocks[newRoom.type]"
                        :blocks="fieldsToNewRooms.blocks[newRoom.type]"
                        default-col-class="col-12" @submit="createRoom"/>
        </div>
      </master-modal>
    </div>
  </div>
</template>
<script>
//Components
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'

export default {
  beforeDestroy() {
    this.$eventBus.$off('inotification.chat.message')
  },
  props: {
    accept: {default: '.pdf, .xlsx, .docx, .pptx, .mp4, .mp3, .jpg, image/*'},
    roomId: {default: false},
    roomsId: {default: false},
    allowCreateChat: {default: false},
    allowProviders: {type: Boolean, defualt: false},
    height: {default: '600px'},
    advancedProps: {default: false},
    loadRooms: {default: true}
  },
  components: {ChatWindow},
  watch: {
    roomId() {
      this.getRooms()
    },
    roomsId() {
      this.getRooms()
    },
    openRoomId(newValue) {
      this.$emit('room-opened', newValue)
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      conversations: [],
      conversationMessages: [],
      openRoomId: null,
      chatPagination: {
        page: 0,
        perPage: 50,
        lastPage: -1
      },
      loading: {
        rooms: false,
        messages: false,
      },
      search: {
        userId: null,
        userList: []
      },
      modalNewRoom: {
        show: false,
        loading: false
      },
      newRoom: {
        type: 'user',
        form: {
          userId: null,
          providerType: null,
          providerId: null,
          firstName: null,
          lastName: null
        }
      }
    }
  },
  computed: {
    //Return accept files
    acceptFiles() {
      //Images
      if (this.accept == 'images') return '.jpg, image/*'
      //documents
      if (this.accept == 'documents') return '.pdf, .xlsx, .docx, .pptx'
      //Media
      if (this.accept == 'media') return '.mp4, .mp3, .jpg, image/*'

      //Default
      let mediaConfig = this.$store.state.qsiteApp.configs.Media
      return this.$clone(mediaConfig ? mediaConfig['allowed-types'] : this.accept)
    },
    //Chat props
    chatProps() {
      return {
        currentUserId: this.$store.state.quserAuth.userId,
        rooms: this.rooms,
        loadingRooms: this.loading.rooms,
        roomsLoaded: !this.loading.rooms,
        messages: this.messages,
        loadingMessages: this.loading.messages,
        showReactionEmojis: false,
        messagesLoaded: (this.chatPagination.page == this.chatPagination.lastPage) ? true : false,
        loadFirstRoom: false,
        singleRoom: this.roomId ? true : false,
        roomId: this.openRoomId,
        showAddRoom: this.allowCreateChat,
        messageActions: [{name: 'replyMessage', title: 'Reply'}],
        acceptedFiles: this.acceptFiles,
        height: this.height,
        menuActions: [],
        userOptions: {minUsers: 1, currentUser: false},
        ...(this.advancedProps || {})
      }
    },
    //Rooms
    rooms() {
      let rooms = []//Response
      let conversations = this.$clone(this.conversations)

      //Sort conversations
      conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

      //Order room
      conversations.forEach(conversation => {
        //Instance roorm
        let room = {
          roomId: conversation.id,
          roomName: conversation.userConversation.fullName,
          avatar: conversation.userConversation.mainImage,
          unreadCount: conversation.unreadMessagesCount || false,
          messageActions: false,
          lastMessage: !conversation.lastMessage ? false : {
            content: conversation.lastMessage.body || '',
            senderId: conversation.lastMessage.userId,
            timestamp: this.$date.getHumanCalendar(conversation.updatedAt)
          },
          users: conversation.users.map(user => {
            return {
              _id: user.id,
              username: user.fullName,
              avatar: user.mainImage,
            }
          })
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
        if (!messages.find(message => message._id == messageData.id)) {
          //Validate reply message
          if (messageData.replyTo) {
            messageData.replyMessage = {
              _id: messageData.replyTo.id,
              content: messageData.replyTo.body || '',
              sender_id: messageData.replyTo.userId,
              file: !messageData.replyTo.attachment ? false : {
                name: messageData.replyTo.attachment.filename,
                size: messageData.replyTo.attachment.filesize,
                type: messageData.replyTo.attachment.mimetype,
                extension: `.${messageData.replyTo.attachment.extension}`,
                url: messageData.replyTo.attachment.path,
                audio: messageData.replyTo.attachment.extension == 'mp3' ? true : false
              }
            }
          }

          //Validate attachment message
          if (messageData.attachment) {
            messageData.file = {
              name: messageData.attachment.filename,
              size: messageData.attachment.filesize,
              type: messageData.attachment.mimetype,
              extension: `.${messageData.attachment.extension}`,
              url: messageData.attachment.path,
              audio: messageData.attachment.extension == 'mp3' ? true : false
            }
          }

          //Instance message
          let message = {
            _id: messageData.id,
            content: messageData.body || '',
            senderId: messageData.user.id,
            username: messageData.user.fullName,
            avatar: messageData.user.mainImage,
            date: this.$trd(messageData.createdAt),
            timestamp: this.$trd(messageData.createdAt, {type: 'time'}),
            file: messageData.file || false,
            replyMessage: messageData.replyMessage || false,
            seen: true,
            frontId: messageData.frontId || false
          }

          //Push room
          messages.push(message)
        }
      })
      //Response
      return this.$clone(messages)
    },
    //Field to dynamic field, new rooms
    fieldsToNewRooms() {
      return {
        type: {
          value: 'user',
          type: 'select',
          props: {
            label: this.$tr('isite.cms.form.type'),
            vIf: this.allowProviders,
            options: [
              {label: this.$tr('isite.cms.label.user'), value: 'user'},
              {label: this.$tr('isite.cms.label.provider'), value: 'provider'}
            ]
          }
        },
        blocks: {
          user: [{
            fields: {
              userId: {
                value: null,
                type: 'select',
                required: true,
                props: {
                  label: this.$tr('isite.cms.label.user') + "*"
                },
                loadOptions: {
                  apiRoute: 'apiRoutes.quser.users',
                  select: {label: 'fullName', id: 'id'},
                  filterByQuery: true
                }
              }
            }
          }],
          provider: [{
            fields: {
              providerType: {
                value: null,
                type: 'select',
                required: true,
                props: {
                  label: this.$tr('isite.cms.label.provider') + "*",
                },
                loadOptions: {
                  apiRoute: 'apiRoutes.qchat.providers',
                  select: {label: 'name', id: 'name'},
                }
              },
              providerId: {
                value: null,
                type: 'input',
                required: true,
                props: {
                  label: this.$tr('isite.cms.label.provider') + " ID*"
                }
              },
              firstName: {
                value: null,
                type: 'input',
                props: {
                  label: this.$tr('isite.cms.form.firstName')
                }
              },
              lastName: {
                value: null,
                type: 'input',
                props: {
                  label: this.$tr('isite.cms.form.lastName')
                }
              }
            }
          }]
        }
      }
    },
  },
  methods: {
    init() {
      //Listen events
      this.listenEvents()
      //Load rooms
      this.getRooms()
    },
    //Listen pusher message
    listenEvents() {
      //New message from pusher
      this.$eventBus.$on('inotification.chat.message', (response) => {
        if (response.data) this.pushMessage(response.data)
      })
    },
    //Get auth user rooms
    getRooms(refresh = false) {
      return new Promise((resolve, reject) => {
        if (this.loadRooms) {
          this.loading.rooms = true
          this.openRoomId = null//Reset room selected
          this.conversations = []//Reset conversation
          this.conversationMessages = []//Reset conversation messages

          //Request Params
          let requestParams = {
            refresh: true,
            params: {
              include: 'users,lastMessage,conversationUsers',
              filter: {ids: this.$clone(this.roomsId)}
            }
          }

          //Request
          if (this.roomId) {//Get only one room
            this.$crud.show('apiRoutes.qchat.conversations', this.roomId, requestParams).then(response => {
              this.orderConversationData([response.data])
              this.openRoomId = this.conversations[0].id
              this.loading.rooms = false // stop load Rooms
              resolve(response.data)
            }).catch(error => {
              this.loading.rooms = false
              resolve(error)
            })
          } else {//Get user auth rooms
            this.$crud.index('apiRoutes.qchat.conversations', requestParams).then(response => {
              this.orderConversationData(response.data)
              this.loading.rooms = false
              resolve(response.data)
            }).catch(error => {
              this.loading.rooms = false
              resolve(error)
            })
          }
        }
      })
    },
    //Order conversation Data (Transform)
    orderConversationData(conversations) {
      //Transform data
      conversations.forEach(conversation => {
        //Set to first level conversation user
        conversation.userConversation = {
          ...conversation.conversationUsers.find(user => user.userId != this.$store.state.quserAuth.userId),
          ...conversation.users.find(user => user.id != this.$store.state.quserAuth.userId)
        }
        //Set to first level conversation auth user
        conversation.authUserConversation = {
          ...conversation.conversationUsers.find(user => user.userId == this.$store.state.quserAuth.userId),
          ...conversation.users.find(user => user.id == this.$store.state.quserAuth.userId)
        }
        //Set to first level unread messages count
        conversation.unreadMessagesCount = parseInt(conversation.authUserConversation.unreadMessagesCount)
      })

      //Assign conversation data
      this.conversations = this.$clone(conversations)
    },
    //Get messages
    getMessages({room, options}) {
      return new Promise((resolve, reject) => {
        this.loading.messages = true
        //Reset room data
        if (options && options.reset) {
          this.conversationMessages = []//Reset chat messages
          this.chatPagination.page = 0//Reset chat page
          this.chatPagination.lastPage = -1//Reset chat plast page
        }
        //Order room data after open
        this.openRoomId = room.roomId//Set open room id
        //Reset unread message to conversation
        let conversationIndex = this.conversations.findIndex(item => item.id == room.roomId)
        this.conversations[conversationIndex].unreadMessagesCount = false
        //Request params
        let requestParams = {
          refresh: true,
          params: {
            page: (this.chatPagination.page + 1),
            take: this.chatPagination.perPage,
            filter: {conversationId: room.roomId},
            include: 'user,replyTo'
          }
        }

        //Request
        this.$crud.index('apiRoutes.qchat.messages', requestParams).then(response => {
          //reset conversation messages
          if (options && options.reset) this.conversationMessages = []
          //Set messages
          this.conversationMessages = this.$clone([...this.conversationMessages, ...response.data])
          //Set chat pagination
          this.chatPagination.lastPage = response.meta.page.lastPage
          this.chatPagination.page = response.meta.page.currentPage
          //Hide loading
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
      return new Promise(async (resolve, reject) => {
        //Default message data
        let messageData = {body: content, frontId: this.$uid()}

        //Set file information to message
        if (file) {
          //Add file to message
          messageData.file = {
            name: file.name,
            size: file.size,
            type: file.type,
            extension: `.${file.extension || file.type}`,
            url: file.localUrl
          }
          //Add audio to message
          if (file.audio) {
            messageData.file.audio = true
            messageData.file.duration = file.duration
          }
        }

        //Set reply id
        if (replyMessage) {
          messageData.replyMessage = replyMessage
        }

        //push Message
        this.pushMessage(messageData)

        //Request data to conversation message
        let requestData = {
          frontId: messageData.frontId,
          conversationId: roomId,
          body: content || '',
          userId: this.$store.state.quserAuth.userId,
          replyToId: replyMessage ? replyMessage._id : null
        }

        //Upload file to media
        if (file) {
          //Parse file
          let fileBase64 = await this.$helper.getBase64(file.blob)
          let fileObject = await this.$helper.urlToFile(
              fileBase64,
              file.audio ? file.name : `${file.name}.${file.extension}`,
              file.type)

          //Form Data
          let fileData = new FormData()
          fileData.append('parent_id', 0)
          fileData.append('file', fileObject)
          fileData.append('disk', 'privatemedia')

          //Request send file
          let fileMedia = await this.$crud.post('apiRoutes.qmedia.files', fileData)

          //Add file id to message
          if (fileMedia && fileMedia.data) {
            requestData.mediasSingle = {attachment: fileMedia.data.id}
            requestData.attached = fileMedia.data.id
          }
        }

        //Request
        this.$crud.create('apiRoutes.qchat.messages', requestData).then(response => {
          //Search message by frontId
          let messageIndex = this.conversationMessages.findIndex(item => item.frontId == response.data.frontId)
          //Set db message id to local message
          if (messageIndex != -1) {
            this.conversationMessages[messageIndex].id = response.data.id
            this.conversationMessages[messageIndex].attachment = response.data.attachment || false
          }
        })
      })
    },
    //Push new message
    pushMessage(message) {
      //Get current conversation ID
      let conversationId = message.conversation ? message.conversation.id : this.openRoomId
      //Get current conversation Index
      let conversationIndex = conversationId ? this.conversations.findIndex(item => item.id == conversationId) : false
      //Get current conversation
      let conversation = (conversationIndex >= 0) ? this.conversations[conversationIndex] : false

      //Message object data
      let messageData = {
        id: this.$uid(),
        user: (message.userId && conversation) ?
            conversation.users.find(user => user.id == message.userId) : this.$store.state.quserAuth.userData,
        createdAt: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        ...message
      }

      //Add conversation if not exist
      if (!conversation && message.conversation) {
        this.orderConversationData([...this.conversations, {
          ...message.conversation,
          lastMessage: messageData
        }])
      }

      //Update conversation data
      if (conversation) {
        //Update last update date
        this.conversations[conversationIndex].updatedAt = this.$moment().format('YYYY-MM-DD HH:mm:ss')
        //Update last message
        this.conversations[conversationIndex].lastMessage = messageData
        //Add unread message counter
        if (message.conversation && (message.conversation.id != this.openRoomId)) {
          this.conversations[conversationIndex].unreadMessagesCount += 1
        }
      }

      //Set local message
      if (!message.conversation || (message.conversation.id == this.openRoomId)) {
        this.conversationMessages.unshift(messageData)
      }

      //Play sound
      this.playSound(message)
    },
    //Play sound message
    playSound(message) {
      //If room is close
      if (message.conversation && (message.conversation.id != this.openRoomId)) {
        this.$helper.playSound({
          url: `${this.$store.state.qsiteApp.baseUrl}/modules/ichat/audio/sound_chat_notification.mp3`
        })
      } else if (message.userId && (message.userId != this.$store.state.quserAuth.userId)) {
        this.$helper.playSound({
          url: `${this.$store.state.qsiteApp.baseUrl}/modules/ichat/audio/sound_message_notification.mp3`,
          volume: 0.2
        })
      }
    },
    //Create conversation
    createRoom() {
      return new Promise((resolve, reject) => {
        let apiRoute = null
        let requestParams = null

        //validate user selected is not same to auth user
        if (this.newRoom.type == "user" && this.newRoom.form.userId) {
          //Get userId
          const userId = this.newRoom.form.userId

          if (userId == this.chatProps.currentUserId) {
            this.modalNewRoom.loading = false
            this.$alert.error(this.$tr('isite.cms.message.errorRequest'))
            return reject(false)
          }

          //Validate if conversation already exist
          let existConversation = this.conversations.find(conversation => {
            return conversation.users.find(user => user.id == userId) ? conversation : false
          })

          //Open conversation
          if (existConversation) {
            this.modalNewRoom = {show: false, loading: false}
            this.openRoomId = existConversation.id
            return resolve(existConversation)
          }

          //Request Params
          apiRoute = 'apiRoutes.qchat.conversations'
          requestParams = {users: [userId, this.chatProps.currentUserId]}
        } else {
          apiRoute = 'apiRoutes.qchat.providerConversations'
          requestParams = {
            provider: this.newRoom.form.providerType,
            conversationId: this.newRoom.form.providerId,
            firstName: this.newRoom.form.firstName,
            lastName: this.newRoom.form.lastName
          }
        }

        if (apiRoute && requestParams) {
          this.modalNewRoom.loading = true
          //Request to Create conversation
          this.$crud.create(apiRoute, requestParams).then(async response => {
            await this.getRooms(true)
            this.openRoomId = response.data.id || response.data.conversation?.id
            this.newRoom.form = {
              userId: null,
              providerType: null,
              providerId: null,
              firstName: null,
              lastName: null
            }
            this.modalNewRoom = {show: false, loading: false}
            resolve(response.data)
          }).catch(error => {
            this.modalNewRoom = {show: false, loading: false}
            reject(error)
          })
        }
      })
    },
    //Menu action handler
    menuActionHandler({roomId, action}) {
      if (action.action) action.action({roomId, action})
    }
  }
}
</script>
<style lang="stylus">
#advanceChatComponentContent
  #vueAdvanceChat
    &.vac-card-window
      box-shadow none

    .vac-room-list
      .vac-room-item
        min-height auto
        padding 8px 10px 8px 8px

        .vac-avatar
          margin-right 8px

        .vac-badge-counter
          height 17px
          width 17px
          font-size 10px
          background-color $blue

</style>
