import React from 'react'
import { useDialogState, DialogDisclosure } from 'reakit'

import SignInDialog from '../modals/signIn'

import styles from './signIn.module.css'

export default function SignIn ({ showSignInPopup }) {
  const signInDialog = useDialogState()
  const signUpDialog = useDialogState()

  return <section className={styles.Container}>
    <h2 className={styles.Title}>New to this viewer?</h2>
    <div className={styles.ButtonRow}>
      <DialogDisclosure {...signInDialog} className={styles.SignInButton}>
        Sign In
      </DialogDisclosure>
      <SignInDialog dialog={signInDialog} />

      <span className={styles.Separator}>or</span>

      <DialogDisclosure {...signUpDialog} className={styles.SignInButton}>
        Sign Up
      </DialogDisclosure>
      <SignInDialog isSignUp dialog={signUpDialog} />
    </div>
  </section>
}
