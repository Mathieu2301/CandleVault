<template>
  <div class="fullpage dark">
    <div class="container">
      <div class="title">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 64 64"><path d="M20,54h4v5h2V54h4a1,1,0,0,0,1-1V25a1,1,0,0,0-1-1H26V19H24v5H20a1,1,0,0,0-1,1V53A1,1,0,0,0,20,54Z"/><path d="M48,52h4v5h2V52h4a1,1,0,0,0,1-1V23a1,1,0,0,0-1-1H54V17H52v5H48a1,1,0,0,0-1,1V51A1,1,0,0,0,48,52Z"/><path d="M6,47h4v5h2V47h4a1,1,0,0,0,1-1V18a1,1,0,0,0-1-1H12V12H10v5H6a1,1,0,0,0-1,1V46A1,1,0,0,0,6,47ZM7,19h8V45H7Z"/><path d="M34,41h4v5h2V41h4a1,1,0,0,0,1-1V12a1,1,0,0,0-1-1H40V6H38v5H34a1,1,0,0,0-1,1V40A1,1,0,0,0,34,41Zm1-28h8V39H35Z"/></svg>
        <div>CandleVault - Login</div>
      </div>

      <div class="tabs anim" :class="{ hidden: forgotPass }">
        <div class="tab anim" :class="{ selected: !newAccount }"
          @click="newAccount = false">Login</div>
        <div class="tab anim" :class="{ selected: newAccount }"
          @click="newAccount = true">Sign Up</div>
      </div>

      <form class="block small" @submit="submit" :style="{
        'border-top-left-radius': (newAccount || forgotPass ? '5px' : 0),
        'border-top-right-radius': (!newAccount || forgotPass ? '5px' : 0),
      }">
        <div class="inputLine">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 32 32"><path d="M27.209,5H4.791A3.794,3.794,0,0,0,1,8.791V23.209A3.794,3.794,0,0,0,4.791,27H27.209A3.794,3.794,0,0,0,31,23.209V8.791A3.794,3.794,0,0,0,27.209,5ZM29,23.209A1.792,1.792,0,0,1,27.209,25H4.791A1.792,1.792,0,0,1,3,23.209V8.791A1.792,1.792,0,0,1,4.791,7H27.209A1.792,1.792,0,0,1,29,8.791Z"/><path d="M25.375,9.219,16,16.719l-9.375-7.5a1,1,0,1,0-1.25,1.562l10,8a1,1,0,0,0,1.25,0l10-8a1,1,0,1,0-1.25-1.562Z"/></svg>
          <input type="email" v-model="email" placeholder="Email" autocomplete="email" required>
        </div>

        <div class="inputLine" :class="{ hidden: forgotPass }">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 115 100"><path d="M96.2322159,19.4196148l0.10112-15.6889267L81.1532745,3.7460341L41.1988449,43.7003822 c-3.0746155-1.2009811-6.4170036-1.8673744-9.9169979-1.8673744c-15.0645866,0-27.2767868,12.2122383-27.2767868,27.2767868  c0,15.0645828,12.2121992,27.276825,27.2767868,27.276825s27.2767887-12.2122421,27.2767887-27.276825 c0-3.5632477-0.5320549-6.556366-1.7746773-9.6766052l7.1106491-6.9181175h10.7869186L74.600647,41.2018661l4.9544754-4.9210892 l5.9951096-0.0641212V25.2731667l10.7831039-0.0012856L96.2322159,19.4196148z M28.4686127,79.7498398  c-4.5036316,0-8.1545181-3.6508789-8.1545181-8.1544724c0-4.5036316,3.6508865-8.1545181,8.1545181-8.1545181 s8.1545181,3.6508865,8.1545181,8.1545181C36.6231308,76.0989609,32.9722443,79.7498398,28.4686127,79.7498398z"/></svg>
          <input type="password" placeholder="Password"
            v-model="password" :required="!forgotPass"
            :autocomplete="newAccount ? 'new-password' : 'current-password'">
        </div>

        <div class="inputLine" :class="{ hidden: forgotPass || !newAccount }">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 115 100"><path d="M96.2322159,19.4196148l0.10112-15.6889267L81.1532745,3.7460341L41.1988449,43.7003822 c-3.0746155-1.2009811-6.4170036-1.8673744-9.9169979-1.8673744c-15.0645866,0-27.2767868,12.2122383-27.2767868,27.2767868  c0,15.0645828,12.2121992,27.276825,27.2767868,27.276825s27.2767887-12.2122421,27.2767887-27.276825 c0-3.5632477-0.5320549-6.556366-1.7746773-9.6766052l7.1106491-6.9181175h10.7869186L74.600647,41.2018661l4.9544754-4.9210892 l5.9951096-0.0641212V25.2731667l10.7831039-0.0012856L96.2322159,19.4196148z M28.4686127,79.7498398  c-4.5036316,0-8.1545181-3.6508789-8.1545181-8.1544724c0-4.5036316,3.6508865-8.1545181,8.1545181-8.1545181 s8.1545181,3.6508865,8.1545181,8.1545181C36.6231308,76.0989609,32.9722443,79.7498398,28.4686127,79.7498398z"/></svg>
          <input type="password" autocomplete="new-password" style="margin-top:0"
            placeholder="Confirm password" v-model="confirm" :required="newAccount">
        </div>

        <input type="submit" :value="
          (newAccount
            ? 'Sign Up'
            : (!forgotPass
              ? 'Login'
              : 'Send email')
          )
        ">

        <div class="msgBlock error"
          :class="{ open: error }"
          @click="error = false">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 25 25"><path d="M21.99,16.345,15.53,5.155a3.5,3.5,0,0,0-6.06,0L3.01,16.345A3.5,3.5,0,0,0,6.04,21.6H18.96a3.5,3.5,0,0,0,3.03-5.25Zm-9.54,2.32a1.165,1.165,0,1,1,1.16-1.17A1.163,1.163,0,0,1,12.45,18.665Zm1.16-5.06a1.16,1.16,0,0,1-2.32,0v-3.44a1.16,1.16,0,0,1,2.32,0Z"/></svg>
          <div>{{ errmsg }}</div>
        </div>

        <div class="minText" :class="{ hidden: newAccount }"
          @click="forgotPass = !forgotPass; error = false">
          {{ !forgotPass ? 'I forgot my password' : 'Back' }}
        </div>
      </form>

      <div style="padding: 20px 0; opacity: 0.7;">or</div>

      <div class="button wIcon" @click="googleLogin">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 118 120"><path d="M117.6,61.3636364 C117.6,57.1090909 117.218182,53.0181818 116.509091,49.0909091 L60,49.0909091 L60,72.3 L92.2909091,72.3 C90.9,79.8 86.6727273,86.1545455 80.3181818,90.4090909 L80.3181818,105.463636 L99.7090909,105.463636 C111.054545,95.0181818 117.6,79.6363636 117.6,61.3636364 L117.6,61.3636364 Z" fill="#4285F4"/><path d="M60,120 C76.2,120 89.7818182,114.627273 99.7090909,105.463636 L80.3181818,90.4090909 C74.9454545,94.0090909 68.0727273,96.1363636 60,96.1363636 C44.3727273,96.1363636 31.1454545,85.5818182 26.4272727,71.4 L6.38181818,71.4 L6.38181818,86.9454545 C16.2545455,106.554545 36.5454545,120 60,120 L60,120 Z" fill="#34A853"/><path d="M26.4272727,71.4 C25.2272727,67.8 24.5454545,63.9545455 24.5454545,60 C24.5454545,56.0454545 25.2272727,52.2 26.4272727,48.6 L26.4272727,33.0545455 L6.38181818,33.0545455 C2.31818182,41.1545455 0,50.3181818 0,60 C0,69.6818182 2.31818182,78.8454545 6.38181818,86.9454545 L26.4272727,71.4 L26.4272727,71.4 Z" fill="#FBBC05"/><path d="M60,23.8636364 C68.8090909,23.8636364 76.7181818,26.8909091 82.9363636,32.8363636 L100.145455,15.6272727 C89.7545455,5.94545455 76.1727273,0 60,0 C36.5454545,0 16.2545455,13.4454545 6.38181818,33.0545455 L26.4272727,48.6 C31.1454545,34.4181818 44.3727273,23.8636364 60,23.8636364 L60,23.8636364 Z" fill="#EA4335"/></svg>
        <div>Sign in with Google</div>
      </div>

      <div class="button wIcon" @click="phoneLogin">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <div>Sign in with phone</div>
      </div>

      <form class="block small" @submit="submitPhone" :class="{ hidden: !phoneForm }">
        <div class="inputLine">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          <input type="tel" placeholder="Phone number" autocomplete="tel"
            v-model="phone" required :disabled="needPhoneCode">
        </div>

        <div class="inputLine" :class="{ hidden: !needPhoneCode }">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 32 32"><path d="M8.57,29.15A2.58,2.58,0,0,1,6,26.58.58.58,0,0,0,5.42,26H4.58A2.58,2.58,0,0,1,2,23.42V8.58A2.58,2.58,0,0,1,4.58,6H27.42A2.58,2.58,0,0,1,30,8.58V23.42A2.58,2.58,0,0,1,27.42,26H16.33a.57.57,0,0,0-.23,0L9.62,28.93A2.58,2.58,0,0,1,8.57,29.15ZM4.58,8A.58.58,0,0,0,4,8.58V23.42a.58.58,0,0,0,.58.58h.85A2.58,2.58,0,0,1,8,26.58a.58.58,0,0,0,.81.53l6.48-2.88a2.57,2.57,0,0,1,1-.22H27.42a.58.58,0,0,0,.58-.58V8.58A.58.58,0,0,0,27.42,8Z"/><circle cx="9" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="23" cy="16" r="2"/></svg>
          <input type="text" placeholder="Validation code" autocomplete="one-time-code"
            v-model="phoneCode" :required="needPhoneCode">
        </div>
        <div id="captcha" v-show="!needPhoneCode"/>
        <input type="submit" value="Confirm" v-show="needPhoneCode">

        <div class="msgBlock error"
          :class="{ open: phoneError }"
          @click="phoneError = false">
          <!-- eslint-disable-next-line -->
          <svg viewBox="0 0 25 25"><path d="M21.99,16.345,15.53,5.155a3.5,3.5,0,0,0-6.06,0L3.01,16.345A3.5,3.5,0,0,0,6.04,21.6H18.96a3.5,3.5,0,0,0,3.03-5.25Zm-9.54,2.32a1.165,1.165,0,1,1,1.16-1.17A1.163,1.163,0,0,1,12.45,18.665Zm1.16-5.06a1.16,1.16,0,0,1-2.32,0v-3.44a1.16,1.16,0,0,1,2.32,0Z"/></svg>
          <div>{{ phoneErrmsg }}</div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
/** @type {import('firebase').default.auth.Auth} */
const auth = window.auth;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;

export default {
  name: 'Login',
  components: {},

  data: () => ({
    loading: false,
    newAccount: false,

    email: localStorage.getItem('email') || '',
    password: '',
    confirm: '',

    forgotPass: false,

    error: false,
    errmsg: null,

    phoneForm: false,
    phone: '',
    phoneCode: '',
    needPhoneCode: false,

    phoneError: false,
    phoneErrmsg: null,
  }),

  methods: {
    submit(e) {
      e.preventDefault();
      this.error = false;
      if (this.newAccount && this.password !== this.confirm) {
        this.error = true;
        this.errmsg = 'Passwords don\'t match';
        return;
      }

      this.loading = true;
      if (this.forgotPass) {
        console.log('Forgotpass');
        auth.sendPasswordResetEmail(this.email).then(() => {
          toast.success({ title: 'Password reset email sent !' });
          this.loading = false;
          this.forgotPass = false;
        }).catch((error) => {
          this.loading = false;
          this.error = true;
          this.errmsg = error.message;
        });
        return;
      }

      if (this.newAccount) {
        auth.createUserWithEmailAndPassword(this.email, this.password).then(() => {
          this.loading = false;
          toast.success({ title: 'Logged in !' });
          auth.currentUser.sendEmailVerification().then(() => {
            toast.success({ title: 'Confirmation email sent !' });
          }).catch((error) => {
            toast.error({ title: error.message });
          });
        }).catch((error) => {
          this.loading = false;
          this.error = true;
          this.errmsg = error.message;
        });
      } else {
        auth.signInWithEmailAndPassword(this.email, this.password).then(() => {
          this.loading = false;
          toast.success({ title: 'Logged in !' });
        }).catch((error) => {
          this.loading = false;
          this.error = true;
          this.errmsg = error.message;
        });
      }

      localStorage.setItem('email', this.email);
    },

    googleLogin() {
      this.loading = true;
      const provider = new window.firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).then((result) => {
        this.loading = false;
        console.log(result);
      }).catch((error) => {
        this.loading = false;
        this.error = true;
        this.errmsg = error.message;
      });
    },

    phoneLogin() {
      if (this.phoneForm) {
        this.phoneForm = false;
        return;
      }

      if (window.recaptchaVerifier) {
        this.phoneForm = true;
        return;
      }

      window.recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('captcha', {
        callback: () => {
          this.loading = true;
          auth.signInWithPhoneNumber(this.phone, window.recaptchaVerifier)
            .then((confirmationResult) => {
              this.loading = false;
              this.phoneError = false;
              this.needPhoneCode = true;
              window.confirmationResult = confirmationResult;
            }).catch((error) => {
              this.loading = false;
              this.phoneError = true;
              this.phoneErrmsg = error.message;
            });
        },
        'expired-callback': () => {
          this.loading = false;
          this.phoneError = false;
          toast.error({ title: 'Captcha expired, please retry' });
        },
      });

      window.recaptchaVerifier.render();
      this.phoneForm = true;
    },

    submitPhone(e) {
      e.preventDefault();
      this.phoneError = false;

      if (this.needPhoneCode) {
        window.confirmationResult.confirm(this.phoneCode).catch((error) => {
          this.phoneError = true;
          this.phoneErrmsg = error.message;
          this.phoneCode = '';
        });
        this.loading = true;
      }
    },
  },
};
</script>
