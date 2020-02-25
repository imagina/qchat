# QCHAT  | 1.0.1 💬

## Imagina Colombia

### Installation

`` npm i @imagina/qchat@1.0.1 ``

### API Routes

| ENTITY  | ROUTE |
| ------------- | ------------- |
| conversations | apiRoutes.qchat.conversations |
| conversationUser  | apiRoutes.qchat.conversationUser |
| messages  | apiRoutes.qchat.messages |
| users  | apiRoutes.qchat.users |


### Pages
  
- #### Back-End

   | PAGE | NAME | PATH |
   | ------------- | ------------- | ------------- |
   | messages | qchat.admin.messages.index | /chat |
   | conversation | qchat.admin.conversation.show | /chat/conversation/:id |
  
### Components  

  | NAME | ROUTE |
  | ------------- | ------------- |
  | conversation | @imagina/qchat/_components/admin/conversation |
  | conversations | @imagina/qchat/_components/admin/conversations |
  | conversationLabel | @imagina/qchat/_components/admin/conversationLabel |
  | message | @imagina/qchat/_components/admin/message |
  | messages | @imagina/qchat/_components/admin/messages |
  | newMessage | @imagina/qchat/_components/admin/newMessage |
  
  If you need only a conversation with a specific user, you can use __conversations component__, this component waits for __conversationId__ as a parameter.
  
  Example:
  
  html
  ```html
  <template>
     <conversation :conversationId="conversationId"/>
  </template> 
  ```
  script
  ```js
  import conversation from '@imagina/qchat/_components/admin/conversation'
  export default {
    components:{
      conversation
    },
    data () {
      return {
        conversationId: 1
      }
    }
  }
  ```
  
  
  
