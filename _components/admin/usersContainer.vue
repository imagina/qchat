<template>
  <div>
    <q-btn
      dense
      flat
      round
      @click="showPanelUsers = !showPanelUsers">
      <q-icon name="message"/>
    </q-btn>
    <transition
      appear
      enter-active-class="animated fadeInLeft"
      leave-active-class="animated fadeOutLeft">
      <div
        v-if="showPanelUsers"
        class="absolute float-div bg-white">
        <q-toolbar class="bg-primary text-white shadow-1 q-py-lg">
          <q-toolbar-title>
            <q-btn
              dense
              flat
              round
              @click="showPanelUsers = !showPanelUsers"
              icon="keyboard_backspace"/>
            Nuevo Chat
          </q-toolbar-title>
        </q-toolbar>
        <q-scroll-area
          ref="scrollAreaUsers"
          style="height: 78vh">
          <q-list>
            <div
              v-for="(user, index) in users"
              :key="index">
              <userLabel :user="user"/>
            </div>
          </q-list>
        </q-scroll-area>
      </div>
    </transition>
  </div>
</template>

<script>
  import userLabel from '@imagina/qchat/_components/admin/userLabel'

  export default {
    components:{
      userLabel
    },
    data () {
      return {
        showPanelUsers: false,
        users: [],
        currentUser: {},
      }
    },
    mounted() {
      this.$nextTick( () => {
        this.getUsers()
      })
    },
    methods: {
      getUsers () {
        this.$crud.index('apiRoutes.quser.users').then( response => (
          this.users = response.data
        )).catch( error => (
          this.$alert.error({
            message: this.$tr('ui.message.errorRequest'),
            pos: 'bottom'
          })
        ))
      },
    }
  }
</script>

<style>
  .float-div{
    width: 100%;
    left: 0;
    top: 0;
    z-index: 100
  }
</style>