<template>
  <div
    class="row bordered-x bordered-b">
    <div class="col-xs-12 bg-grey-2 bordered-x bordered-t">
      <q-item class="bordered-b">
        <q-item-section avatar class="q-pa-sm">
          <q-avatar>
            <img :src="this.$store.state.quserAuth.userData.mainImage">
          </q-avatar>
        </q-item-section>
        <q-item-section>{{this.$store.state.quserAuth.userData.fullName}}</q-item-section>
      </q-item>
      <q-input
        rounded
        outlined
        :placeholder="$tr('qchat.layout.search')"
        bg-color="white"
        class="full-width q-pa-sm"
        v-model="search"
        dense>
        <template v-slot:append>
          <q-icon
            color="primary"
            v-if="search"
            name="close"
            @click.stop="search = ''"
            class="cursor-pointer" />
          <q-icon
            v-else
            color="primary"
            name="search"/>
        </template>
      </q-input>
    </div>
    <div class="col-xs-12 relative-position">
      <q-scroll-area
        ref="scrollArea"
        style="height: 75vh"
        class="bordered-a">
        <q-list class="rounded-borders">
          <div>
            <conversationsLabel
              v-for="(conversation, index) in conversationsFiltered"
              :key="index"
              :conversation="conversation"/>
          </div>
        </q-list>
        <infinite-loading
          class="q-pt-md"
          spinner="waveDots"
          @infinite="infiniteHandler">
          <div slot="no-more">
            {{$tr('qchat.layout.message.noMoreConversations')}}
          </div>
          <div slot="spinner">
            <skeletonList :cant="Math.floor((Math.random() * 5) + 1)"/>
          </div>
          <div slot="no-results">
            {{$tr('qchat.layout.message.noConversationsResults')}}
          </div>
          <div slot="error">
            {{$tr('qchat.layout.message.error')}}
          </div>
        </infinite-loading>
      </q-scroll-area>
    </div>
  </div>
</template>

<script>
  import { orderArray } from '@imagina/qchat/utils/index'
  import conversationsLabel from '@imagina/qchat/_components/admin/conversationsLabel'
  import skeletonList from '@imagina/qchat/_components/common/skeletonList'
  import InfiniteLoading from 'vue-infinite-loading'

  export default {
    components:{
      conversationsLabel,
      skeletonList,
      InfiniteLoading
    },
    data () {
      return {
        loading: false,
        conversations: [],
        pagination:{
          page: 1,
          take: 20
        },
        search: '',
      }
    },
    computed: {
      conversationsFiltered () {
        return this.conversations.filter( conversation => {
          return conversation.user.fullName.toLowerCase().includes(this.search.toLowerCase())
        })
      }
    },
    methods:{
      infiniteHandler($state) {
        let params = {
          refresh: true,
          params: {
            filter: {
              myconversations: true
            },
            page: this.pagination.page,
            take: this.pagination.take,
          },
        }
        this.$crud.index('apiRoutes.qchat.conversations',  params).then( ({ data })  => {
          if (data.length) {
            this.pagination.page += 1;
            this.conversations.push(...this.formatedConversation(data));
            $state.loaded();
          } else {
            $state.complete();
          }
        }).catch( error => {
          console.error( error)
        })
      },
      formatedConversation(data){
        return data.map( conversation => {
          let authUserId = this.$store.state.quserAuth.userId
          let newUser = {
            ...conversation,
            user: conversation.users.find( user => user.id != authUserId)
          }
          delete newUser.users
          return newUser
        })
      }
    }
  }
</script>

