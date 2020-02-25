<template>
  <div>
    
    <div v-for="(key, index) in cant-1" :key="index">
      
      <div class="q-pa-sm">
        <q-item style="width: 300px" >
          <q-item-section avatar>
            <q-skeleton type="QAvatar" animation="fade"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" width="50%" animation="fade"/>
            </q-item-label>
            <q-item-label>
              <q-skeleton type="QInput" animation="fade"/>
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
  
      <div class="q-pa-sm">
        <q-item style="width: 300px" >
          <q-item-section avatar>
            <q-skeleton type="QAvatar" animation="fade"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" width="50%" animation="fade"/>
            </q-item-label>
            <q-item-label>
              <q-skeleton type="QInput" animation="fade"/>
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
  
      <div class="q-pa-sm flex justify-end" >
        <q-item style="width: 300px" >
          <q-item-section>
            <q-item-label class="flex justify-end">
              <q-skeleton type="text" width="50%" animation="fade"/>
            </q-item-label>
            <q-item-label>
              <q-skeleton type="QInput" animation="fade"/>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-skeleton type="QAvatar" animation="fade"/>
          </q-item-section>
        </q-item>
      </div>
    </div>
    
  </div>
</template>

<script>
  export default {
    props:{
      cant:{
        type: Number,
        default: 0
      }
    }
  }
</script>
