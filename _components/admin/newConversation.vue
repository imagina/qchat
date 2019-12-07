<template>
  <q-dialog
    maximized
    no-backdrop-dismiss
    v-model="open">
    <q-card class="relative-position q-pt-lg">
      <q-header>
        <q-toolbar class="bg-primary text-white absolute-top">
          <q-btn
              @click="$emit('closeModal')"
              flat
              color="white"
              flat
              dense
              v-close-popup
              icon="arrow_left"
          />
          <q-toolbar-title>
            Contactos
          </q-toolbar-title>
          <q-input dark borderless v-model="filter.search" input-class="text-right" class="q-ml-md" @input="getUsers">
            <template v-slot:append>
              <q-icon v-if="filter.search === ''" name="search" />
              <q-icon v-else name="clear" class="cursor-pointer" @click="filter.search= ''" />
            </template>
          </q-input>
        </q-toolbar>
      </q-header>
      <div class="q-pa-lg">
        <div class="row q-gutter-sm">
          <div class="col-md-12 q-mt-lg">
            <q-list>
              <q-item clickable v-ripple v-for="(user,index) in users" :key="index" @click="selectUser(user)" v-if="user">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="getUrlImg(user.mainImage)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>{{ user.fullName }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
  import { required } from 'vuelidate/lib/validators'
  export default {
    props:{
      open:{
        type: Boolean,
        default: false
      }
    },
    data () {
      return{
        users: [],
        filter:{
          search: ''
        }
      }
    },
    mounted() {
      this.getUsers()
    },
    methods : {
      getUrlImg(uri){
        if(uri.lastIndexOf('http')>-1) {
          return uri
        }else{
          return `${config('apiRoutes.api.base_url')}/${uri}`
        }
      },
      getUsers(){
        let params = {
          params: {
            include: 'fields,conversationsusers',
            filter: this.filter
          }
        }
        this.$crud.index('apiRoutes.quser.users', params)
        .then( response => {
          let userId = this.$store.state.quserAuth.userId
          this.users = response.data.map(item => {
            if(userId===item.id){
              return false
            }
            return {
              fullName: item.fullName,
              id: item.id,
              mainImage: item.mainImage,
              conversationsusers: item.conversationsusers
            }
          })
        })
        .catch( error => {
          console.warn( error )
        })
      },
      selectUser(user){
        this.$emit('select',user)
      }
    }
  }
</script>

<style scoped>

</style>
