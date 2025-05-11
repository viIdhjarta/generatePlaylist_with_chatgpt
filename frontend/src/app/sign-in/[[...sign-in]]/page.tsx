import { SignIn } from '@clerk/nextjs'

const SignInPage = () => {
  return (
    <div className="w-full mt-4 flex justify-center items-center bg-black">
      <SignIn fallbackRedirectUrl={'/'} />
    </div>
  )
}

export default SignInPage
