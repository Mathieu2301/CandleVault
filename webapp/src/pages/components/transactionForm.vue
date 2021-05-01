<template>
  <div class="transactionForm">
    <div class="tabs">
      <div class="tab" :class="{ selected: !send }"
        @click="send = false">Receive</div>
      <div class="tab" :class="{ selected: send }"
        @click="send = true">Send</div>
    </div>
    <div class="block" :style="{
      'border-top-left-radius': (send ? '5px' : 0),
      'border-top-right-radius': (!send ? '5px' : 0),
    }">
      <div class="title">{{ send ? 'Send' : 'Receive' }} money</div>

      <form class="content" v-if="send" @submit="initTransaction">
        <div class="inputLine textInput">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 256 256"><path d="M173.3,33.3H82.7c-27.1,0-49.3,22.2-49.3,49.3v90.7c0,27.1,22.2,49.3,49.3,49.3h90.7 c27.1,0,49.3-22.2,49.3-49.3V82.7C222.7,55.5,200.5,33.3,173.3,33.3z M104.4,76.8c4-6.1,8.3-6,8.3-6s6.7-6.9,19.5-4.6 c12.7,2.3,18.8,10.2,19.9,17.3c1.1,7.2,0,12.8,0,12.8s2.3,0.5,2.3,3.8c0,3.3-1.7,10.7-6,10.3c0,0-4.3,13.6-10,18.3 c-5.7,4.7-7.3,4.7-10.9,4.7c0,0-4.5,0.4-7.3-1.6c-2.9-2-11.6-10.6-13.4-21.5c0,0-3-0.5-4.1-4.9c-1.2-4.5-1.5-7.2,1.2-8.5 C103.7,96.8,100.5,82.8,104.4,76.8z M75.5,180c3-18.9,9.7-36.1,12.5-39.3c2.8-3.1,11.7-3,15.2-3.7c3.4-0.7,9.2-6.7,9.2-6.7 c2,7.7,15.6,10.8,15.6,10.8s13.6-3.1,15.6-10.8c0,0,5.8,5.9,9.2,6.7c3.4,0.7,12.3,0.6,15.2,3.7c2.8,3.1,9.5,20.4,12.5,39.3 C180.5,193.8,75.5,193.8,75.5,180z"/></svg>
          <input type="text" v-model="accountID" required placeholder="Account ID">
        </div>
        <div class="inputLine textInput">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 120 100"><path d="M41.03,75.5631a36.0046,36.0046,0,0,1-8.53276-13.48759H62.54351V55.23485H30.81415a36.54978,36.54978,0,0,1,.00006-10.46951h31.7293V37.92468h-30.046a36.216,36.216,0,0,1,50.746-20.03193l4.05209-7.80644A44.98513,44.98513,0,0,0,23.28816,37.92468H12.70443v6.84066H21.9543a44.06491,44.06491,0,0,0-.00006,10.46951H12.70443v6.84066H23.288A44.87784,44.87784,0,0,0,87.29557,89.91436l-4.05209-7.80644A36.00313,36.00313,0,0,1,41.03,75.5631Z"/></svg>
          <input type="text" v-model="amount" required placeholder="Amount">
        </div>
        <div class="inputLine textInput">
          <!-- eslint-disable-next-line -->
          <svg viewBox="10 0 95 100"><path d="M62.9,20.5H37.1c-8.5,0-15.4,6.9-15.4,15.4v17.2c0,7.8,5.9,14.3,13.4,15.3v9.1c0,0.8,0.4,1.4,1.1,1.8 c0.3,0.1,0.6,0.2,0.9,0.2c0.4,0,0.8-0.1,1.2-0.4l14.2-10.6h10.3c8.5,0,15.4-6.9,15.4-15.4V35.9C78.3,27.4,71.4,20.5,62.9,20.5z M74.3,53.1c0,6.3-5.1,11.4-11.4,11.4h-11c-0.4,0-0.9,0.1-1.2,0.4l-11.5,8.6v-7c0-1.1-0.9-2-2-2c-6.3,0-11.4-5.1-11.4-11.4V35.9 c0-6.3,5.1-11.4,11.4-11.4h25.7c6.3,0,11.4,5.1,11.4,11.4V53.1z"/></svg>
          <input type="text" v-model="transacName" required placeholder="Comment">
        </div>
        <input type="submit" :value="'Send ' + amountText">
      </form>

      <div v-else class="content">
        <div class="inputLine textInput">
          <div class="text">Account ID</div>
          <input type="text" disabled :value="fUser.uid">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 28 26" @click="copyUID"><g transform="translate(0,-270.54165)"><path d="m 10.054167,272.12915 c -1.1589013,0 -2.1166663,0.95777 -2.1166663,2.11667 a 0.79382938,0.79382938 0 1 0 1.5875,0 c 0,-0.30689 0.222276,-0.52917 0.5291663,-0.52917 H 20.6375 c 0.306891,0 0.529167,0.22228 0.529167,0.52917 v 14.81666 c 0,0.30689 -0.222276,0.52917 -0.529167,0.52917 a 0.79382938,0.79382938 0 1 0 0,1.5875 c 1.158902,0 2.116667,-0.95777 2.116667,-2.11667 v -14.81666 c 0,-1.1589 -0.957765,-2.11667 -2.116667,-2.11667 z m -4.2333333,4.23333 c -1.158902,0 -2.116667,0.95777 -2.116667,2.11667 v 14.81667 c 0,1.1589 0.957765,2.11666 2.116667,2.11666 H 16.404167 c 1.158902,0 2.116667,-0.95776 2.116667,-2.11666 v -14.81667 c 0,-1.1589 -0.957765,-2.11667 -2.116667,-2.11667 z m 0,1.5875 H 16.404167 c 0.30689,0 0.529167,0.22228 0.529167,0.52917 v 14.81667 c 0,0.30689 -0.222277,0.52916 -0.529167,0.52916 H 5.8208337 c -0.30689,0 -0.529167,-0.22227 -0.529167,-0.52916 v -14.81667 c 0,-0.30689 0.222277,-0.52917 0.529167,-0.52917 z"/></g></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/** @type {import('firebase').default.firestore.Firestore} */
const db = window.db;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;

export default {
  name: 'TransactionForm',

  props: {
    fUser: Object,
    user: Object,
  },

  data: () => ({
    send: false,

    transacName: '',
    accountID: '',
    amount: '',
  }),

  watch: {
    amount() {
      this.amount = this.amount.replace(/[^0-9.]/g, '');
    },
  },

  computed: {
    amountText() {
      const val = parseFloat(this.amount) || 0;
      return this.amount
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
        : '0,00 €';
    },
  },

  methods: {
    initTransaction(e) {
      e.preventDefault();
      const amount = parseFloat(this.amount);

      if (!amount) {
        toast.error({ title: 'Wrong amount input' });
        return;
      }

      if (amount >= this.user.money) {
        toast.error({ title: 'You don\'t have enough money' });
        return;
      }

      if (this.user.money - amount < 100) {
        toast.error({ title: 'You don\'t have enough money, you have to keep at least 100€ on your account' });
        return;
      }

      if (this.accountID === this.fUser.uid) {
        toast.error({ title: 'You can\'t send money to yourself' });
        return;
      }

      db.collection('candlevault_transactions').add({
        state: 'WAITING',
        name: this.transacName,
        from: this.fUser.uid,
        to: this.accountID,
        value: amount,
      }).then(() => {
        this.accountID = '';
        this.transacName = '';
        this.amount = '';
        toast.success({ title: 'Transaction created' });
      }).catch(() => {
        toast.error({ title: 'Invalid destination Account' });
      });
    },

    copyUID() {
      navigator.permissions.query({ name: 'clipboard-write' }).then(({ state }) => {
        if (state !== 'granted') {
          toast.error({ title: 'Can\'t copy Account ID' });
          return;
        }
        navigator.clipboard.writeText(this.fUser.uid).then(() => {
          toast.success({ title: 'Account ID copied in clipboard' });
        }, () => {
          toast.error({ title: 'Can\'t copy Account ID' });
        });
      });
    },
  },
};
</script>
