import React from 'react'

import styles from './signIn.module.css'

export default function SignIn ({ showSignInPopup }) {
  return <section className={styles.Container}>
    <h2 className={styles.Title}>New to this viewer?</h2>
    <div className={styles.ButtonRow}>
      <button className={styles.SignInButton} onClick={() => { showSignInPopup('signIn') }}>
        Sign In
      </button>
      <span className={styles.Separator}>or</span>
      <button className={styles.SignInButton} onClick={() => { showSignInPopup('signUp') }}>
        Sign Up
      </button>
    </div>
  </section>
}
