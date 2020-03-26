<template>
  <div
    class="row bordered-x bordered-b ">
    <div :class="`col-xs-12 bordered-t ${$q.platform.is.mobile ? 'bordered-l' : ''}`">
      <q-item class="bordered-b bg-grey-2">
        
        <q-item-section
          v-if="$q.platform.is.mobile"
          side >
          <q-btn
            @click="goBack"
            flat
            dense
            round
            icon="keyboard_arrow_left"
          />
        </q-item-section>
        
        <q-item-section avatar class="q-pa-sm ">
          <q-avatar>
            <img :src="user ? user.mainImage : 'https://modulos.imaginacolombia.com/modules/iprofile/img/default.jpg'">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          {{ user ? user.fullName : '' }}
        </q-item-section>
      </q-item>
      <div class="col-xs-12">
        <messages
          :conversationId="conversationId"/>
      </div>
    </div>
  </div>
</template>

<script>
  import messages from '@imagina/qchat/_components/admin/messages'

  export default {
    components:{
      messages,
    },
    props:{
      conversationId:{
        type: String,
      },
    },
    data () {
      return {
        loading: false,
        conversation: {
          users: [],
        },
      }
    },
    computed: {
      user(){
        return this.conversation.users.find( user =>
          user.id != this.$store.state.quserAuth.userId
        );
      },
    },
    watch:{
      '$route.params.id': function (val) {
        this.init()
      }
    },
    created(){
      this.$nextTick(() => {
        this.init()
      })
    },
    methods:{
      init(){
        this.conversation =  {
          users: [],
        }
        this.page = 1
        if (this.conversationId){
          this.getConversation(this.conversationId)
        }
      },
      getConversation(criteria){
        let params = {
          refresh: true,
          params: {
            include: 'users'
          }
        }
        this.loading = true
        this.$crud.show('apiRoutes.qchat.conversations', criteria, params).then(response => {
          this.conversation = response.data
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      },
      goBack(){
        this.$router.push({
          name: 'qchat.admin.messages.index'
        })
      }
    }
  }
</script>
