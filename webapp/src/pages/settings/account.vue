<template>
  <div class="block">
    <div class="title">Account</div>

    <div class="gridForm">
      <div class="inputLine">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 32 32"><circle cx="8" cy="11" r="4"/><path d="M10,16H6a5,5,0,0,0-5,5v4a1,1,0,0,0,1,1H14a1,1,0,0,0,1-1V21A5,5,0,0,0,10,16Z"/><path d="M30,15H18a1,1,0,0,1,0-2H30a1,1,0,0,1,0,2Z"/><path d="M30,19H18a1,1,0,0,1,0-2H30a1,1,0,0,1,0,2Z"/><path d="M24,23H18a1,1,0,0,1,0-2h6a1,1,0,0,1,0,2Z"/></svg>
        <input type="text" placeholder="Display name" autocomplete="name"
          v-model="aForm.displayName">
      </div>
      <div class="saveBtn button green" @click="saveDisplayName" :class="{
        disabled: !aForm.displayName || aForm.displayName === fUser.displayName
      }">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 100 100"><path d="M 17 10 C 13.173891 10 10 13.17389 10 17 L 10 83 C 10 86.8261 13.173891 90 17 90 L 83 90 C 86.826109 90 90 86.8261 90 83 L 90 29 A 3.0002998 3.0002998 0 0 0 89.125 26.875 L 73.125 10.875 A 3.0002998 3.0002998 0 0 0 71 10 L 17 10 z M 17 16 L 25 16 L 25 41 A 3.0002995 3.0002995 0 0 0 28 44 L 68 44 A 3.0002995 3.0002995 0 0 0 71 41 L 71 17.25 L 84 30.25 L 84 83 C 84 83.6059 83.605889 84 83 84 L 17 84 C 16.394111 84 16 83.6059 16 83 L 16 17 C 16 16.39411 16.394111 16 17 16 z M 31 16 L 65 16 L 65 38 L 31 38 L 31 16 z M 50 51 C 42.855832 51 37 56.8558 37 64 C 37 71.1441 42.855832 77 50 77 C 57.144168 77 63 71.1441 63 64 C 63 56.8558 57.144168 51 50 51 z M 50 57 C 53.901527 57 57 60.0985 57 64 C 57 67.9015 53.901527 71 50 71 C 46.098473 71 43 67.9015 43 64 C 43 60.0985 46.098473 57 50 57 z"/></svg>
      </div>

      <div class="inputLine">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 32 32"><path d="M27.209,5H4.791A3.794,3.794,0,0,0,1,8.791V23.209A3.794,3.794,0,0,0,4.791,27H27.209A3.794,3.794,0,0,0,31,23.209V8.791A3.794,3.794,0,0,0,27.209,5ZM29,23.209A1.792,1.792,0,0,1,27.209,25H4.791A1.792,1.792,0,0,1,3,23.209V8.791A1.792,1.792,0,0,1,4.791,7H27.209A1.792,1.792,0,0,1,29,8.791Z"/><path d="M25.375,9.219,16,16.719l-9.375-7.5a1,1,0,1,0-1.25,1.562l10,8a1,1,0,0,0,1.25,0l10-8a1,1,0,1,0-1.25-1.562Z"/></svg>
        <input type="text" placeholder="Email" autocomplete="email"
          v-model="aForm.email">
      </div>

      <div class="saveBtn button green" @click="saveEmail" :class="{
        disabled: !aForm.email || aForm.email === fUser.email
      }">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 100 100"><path d="M 17 10 C 13.173891 10 10 13.17389 10 17 L 10 83 C 10 86.8261 13.173891 90 17 90 L 83 90 C 86.826109 90 90 86.8261 90 83 L 90 29 A 3.0002998 3.0002998 0 0 0 89.125 26.875 L 73.125 10.875 A 3.0002998 3.0002998 0 0 0 71 10 L 17 10 z M 17 16 L 25 16 L 25 41 A 3.0002995 3.0002995 0 0 0 28 44 L 68 44 A 3.0002995 3.0002995 0 0 0 71 41 L 71 17.25 L 84 30.25 L 84 83 C 84 83.6059 83.605889 84 83 84 L 17 84 C 16.394111 84 16 83.6059 16 83 L 16 17 C 16 16.39411 16.394111 16 17 16 z M 31 16 L 65 16 L 65 38 L 31 38 L 31 16 z M 50 51 C 42.855832 51 37 56.8558 37 64 C 37 71.1441 42.855832 77 50 77 C 57.144168 77 63 71.1441 63 64 C 63 56.8558 57.144168 51 50 51 z M 50 57 C 53.901527 57 57 60.0985 57 64 C 57 67.9015 53.901527 71 50 71 C 46.098473 71 43 67.9015 43 64 C 43 60.0985 46.098473 57 50 57 z"/></svg>
      </div>
      <div class="button fullGrid big" v-if="!fUser.emailVerified && fUser.email"
        :class="{ disabled: validEmailSent }" @click="sendConfirmEmail">
        {{ validEmailSent ? 'Email sent ✓' : 'Send verification email'}}
      </div>

      <div class="inputLine">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <input type="text" placeholder="Phone number" autocomplete="tel"
          v-model="aForm.phoneNumber">
      </div>
      <div class="saveBtn button green" @click="savePhone" :class="{
        disabled: !aForm.phoneNumber || aForm.phoneNumber === fUser.phoneNumber
      }">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 100 100"><path d="M 17 10 C 13.173891 10 10 13.17389 10 17 L 10 83 C 10 86.8261 13.173891 90 17 90 L 83 90 C 86.826109 90 90 86.8261 90 83 L 90 29 A 3.0002998 3.0002998 0 0 0 89.125 26.875 L 73.125 10.875 A 3.0002998 3.0002998 0 0 0 71 10 L 17 10 z M 17 16 L 25 16 L 25 41 A 3.0002995 3.0002995 0 0 0 28 44 L 68 44 A 3.0002995 3.0002995 0 0 0 71 41 L 71 17.25 L 84 30.25 L 84 83 C 84 83.6059 83.605889 84 83 84 L 17 84 C 16.394111 84 16 83.6059 16 83 L 16 17 C 16 16.39411 16.394111 16 17 16 z M 31 16 L 65 16 L 65 38 L 31 38 L 31 16 z M 50 51 C 42.855832 51 37 56.8558 37 64 C 37 71.1441 42.855832 77 50 77 C 57.144168 77 63 71.1441 63 64 C 63 56.8558 57.144168 51 50 51 z M 50 57 C 53.901527 57 57 60.0985 57 64 C 57 67.9015 53.901527 71 50 71 C 46.098473 71 43 67.9015 43 64 C 43 60.0985 46.098473 57 50 57 z"/></svg>
      </div>
      <div class="fullGrid" id="captcha" v-show="needCaptcha"/>

      <div class="button fullGrid big" v-if="fUser.email"
        :class="{ disabled: resetEmailSent }" @click="sendResetPassword">
        {{ resetEmailSent ? 'Email sent ✓' : 'Reset password'}}
      </div>

      <div class="separator"/>

      <div class="button wIcon fullGrid" @click="googleLink">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 118 120"><path d="M117.6,61.3636364 C117.6,57.1090909 117.218182,53.0181818 116.509091,49.0909091 L60,49.0909091 L60,72.3 L92.2909091,72.3 C90.9,79.8 86.6727273,86.1545455 80.3181818,90.4090909 L80.3181818,105.463636 L99.7090909,105.463636 C111.054545,95.0181818 117.6,79.6363636 117.6,61.3636364 L117.6,61.3636364 Z" fill="#4285F4"/><path d="M60,120 C76.2,120 89.7818182,114.627273 99.7090909,105.463636 L80.3181818,90.4090909 C74.9454545,94.0090909 68.0727273,96.1363636 60,96.1363636 C44.3727273,96.1363636 31.1454545,85.5818182 26.4272727,71.4 L6.38181818,71.4 L6.38181818,86.9454545 C16.2545455,106.554545 36.5454545,120 60,120 L60,120 Z" fill="#34A853"/><path d="M26.4272727,71.4 C25.2272727,67.8 24.5454545,63.9545455 24.5454545,60 C24.5454545,56.0454545 25.2272727,52.2 26.4272727,48.6 L26.4272727,33.0545455 L6.38181818,33.0545455 C2.31818182,41.1545455 0,50.3181818 0,60 C0,69.6818182 2.31818182,78.8454545 6.38181818,86.9454545 L26.4272727,71.4 L26.4272727,71.4 Z" fill="#FBBC05"/><path d="M60,23.8636364 C68.8090909,23.8636364 76.7181818,26.8909091 82.9363636,32.8363636 L100.145455,15.6272727 C89.7545455,5.94545455 76.1727273,0 60,0 C36.5454545,0 16.2545455,13.4454545 6.38181818,33.0545455 L26.4272727,48.6 C31.1454545,34.4181818 44.3727273,23.8636364 60,23.8636364 L60,23.8636364 Z" fill="#EA4335"/></svg>
        <div>{{ googleProvider ? 'Unlink from' : 'Link with' }} Google</div>
      </div>
    </div>

    <div class="button bigRed" @click="disconnect">Disconnect</div>
  </div>
</template>

<script>
/** @type {import('firebase').default} */
const firebase = window.firebase;

/** @type {import('firebase').default.auth.Auth} */
const auth = window.auth;

/** @type {import('izitoast').IziToast} */
const toast = window.toast;
const toastErr = (err) => toast.error({ title: err.message });

export default {
  name: 'AccountSettings',

  props: {
    fUser: Object,
  },

  data: () => ({
    aForm: {
      email: '',
      displayName: '',
      phoneNumber: '',
    },

    googleProvider: false,

    validEmailSent: false,
    resetEmailSent: false,
    needCaptcha: false,
  }),

  mounted() {
    this.updateValues();
  },

  watch: {
    fUser() {
      this.updateValues();
    },
  },

  methods: {
    updateValues() {
      this.aForm.email = this.fUser.email;
      this.aForm.displayName = this.fUser.displayName;
      this.aForm.phoneNumber = this.fUser.phoneNumber;

      this.googleProvider = !!auth.currentUser.providerData.find((p) => p.providerId === 'google.com');
    },

    saveDisplayName() {
      auth.currentUser.updateProfile({
        displayName: this.aForm.displayName,
      }).then(() => {
        auth.updateCurrentUser(auth.currentUser);
        toast.success({ title: 'Display name changed !' });
      }).catch(toastErr);
    },

    saveEmail() {
      auth.currentUser.updateEmail(this.aForm.email).then(() => {
        auth.updateCurrentUser(auth.currentUser);
        toast.success({ title: 'Email changed !' });
      }).catch(toastErr);
    },

    sendConfirmEmail() {
      auth.currentUser.sendEmailVerification().then(() => {
        this.validEmailSent = true;
        toast.success({ title: 'Verification email sent' });
      }).catch(toastErr);
    },

    sendResetPassword() {
      toast.confirm('We will send you an email to reset your password', () => {
        auth.sendPasswordResetEmail(auth.currentUser.email).then(() => {
          this.resetEmailSent = true;
          toast.success({ title: 'Password reset email sent' });
        }).catch(toastErr);
      });
    },

    googleLink() {
      const provider = new firebase.auth.GoogleAuthProvider();
      this.providerLinkChange(provider, 'Google', this.googleProvider);
    },

    providerLinkChange(provider, name, unlink = true) {
      if (unlink) {
        toast.confirm(`Are you sure you want to unlink your ${name} account ?`, () => {
          auth.currentUser.unlink(provider.providerId).then(() => {
            auth.updateCurrentUser(auth.currentUser);
            toast.success({ title: `${name} account unlinked !` });
          }).catch(toastErr);
        });
      } else {
        auth.currentUser.linkWithPopup(provider).then(() => {
          auth.updateCurrentUser(auth.currentUser);
          toast.success({ title: `${name} account linked !` });
        }).catch(toastErr);
      }
    },

    disconnect() {
      localStorage.removeItem('trades');
      localStorage.removeItem('markets');
      localStorage.removeItem('transactions');
      auth.signOut().then(() => window.location.reload()).catch(toastErr);
    },

    savePhone() {
      this.needCaptcha = true;
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('captcha', {
        callback: () => {
          const method = `${(auth.currentUser.phoneNumber ? 'reauthenticate' : 'link')}WithPhoneNumber`;
          auth.currentUser[method](this.aForm.phoneNumber, window.recaptchaVerifier)
            .then((confirmationResult) => {
              this.needCaptcha = false;
              this.phoneConfirm = confirmationResult;
              toast.show({
                timeout: false,
                overlay: true,
                displayMode: 'once',
                id: 'phoneCode',
                zindex: 999,
                title: 'Enter phone code',
                position: 'center',
                drag: false,
                inputs: [
                  ['<input type="text" autocomplete="one-time-code">', 'keyup', (i, t, input, e) => {
                    if (input.value.length !== 6
                      || (e.keyCode !== 13 && (e.keyCode < 96 || e.keyCode > 105))
                    ) return;

                    if (auth.currentUser.phoneNumber) {
                      const credential = firebase.auth.PhoneAuthProvider.credential(
                        confirmationResult.verificationId, input.value,
                      );
                      auth.currentUser.updatePhoneNumber(credential).then(() => {
                        auth.updateCurrentUser(auth.currentUser);
                        toast.success({ title: 'Phone changed !' });
                        i.hide({ transitionOut: 'fadeOut' }, t, 'OK');
                      }).catch(toastErr);
                    } else {
                      confirmationResult.confirm(input.value).then(() => {
                        auth.updateCurrentUser(auth.currentUser);
                        toast.success({ title: 'Phone linked !' });
                        i.hide({ transitionOut: 'fadeOut' }, t, 'OK');
                      }).catch(toastErr);
                    }
                  }, true],
                ],
              });
            }).catch((err) => {
              this.needCaptcha = false;
              toastErr(err);
            });
        },
        'expired-callback': () => {
          this.needCaptcha = false;
          toast.error({ title: 'Captcha expired, please retry' });
        },
      });

      window.recaptchaVerifier.render();
    },
  },
};
</script>

<style scoped>
.gridForm {
  display: grid;
  grid-template-columns: auto 45px;
  max-width: 350px;
  margin: 0 auto;
}

.gridForm > svg {
  width: 50px;
  height: calc(100% - 10px);
  margin: 5px 0;
  fill: var(--color1);
  background-color: var(--color7);
  padding: 0 13px;
}

.fullGrid {
  grid-column: 1 / 3;
}

.saveBtn {
  width: 40px;
  padding: 0;
  margin: 2px 0;
  margin-left: 5px;
  border-radius: 3px;
}

.saveBtn > svg {
  height: 25px;
  width: 100%;
}

.saveBtn.disabled {
  cursor: not-allowed;
}

.big {
  grid-column: 1 / 3;
  grid-template-columns: auto;
  background-color: var(--color7);
  color: var(--color1);
  margin-top: 3px
}

/* .sticked { margin-top: 0 !important }
svg.sticked { height: calc(100% - 5px) } */

@media screen and (max-width: 370px) {
  .gridForm > svg {
    width: 0;
    padding: 0;
  }
}
</style>
