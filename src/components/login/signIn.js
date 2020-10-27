import { useDialogState, DialogDisclosure } from 'reakit'

import SignInDialog from '../modals/signIn'

export default function SignIn () {
  const signInDialog = useDialogState()
  const signUpDialog = useDialogState()

  return (
    <section
      className='flex flex-col items-center justify-center p-4 m-4 text-white bg-gray-700 rounded'
    >
      <h2 className='text-xl'>New to this viewer?</h2>
      <div className='flex flex-row items-center justify-center mt-4 mb-2'>
        <DialogDisclosure {...signInDialog} className='text-xl shadow btn'>
          Sign In
        </DialogDisclosure>
        <SignInDialog dialog={signInDialog} />

        <div className='mx-3'>or</div>

        <DialogDisclosure {...signUpDialog} className='text-xl shadow btn'>
          Sign Up
        </DialogDisclosure>
        <SignInDialog isSignUp dialog={signUpDialog} />
      </div>
    </section>
  )
}
