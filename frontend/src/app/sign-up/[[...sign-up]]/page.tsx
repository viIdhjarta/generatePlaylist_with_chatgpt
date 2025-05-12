import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col justify-between">
      <div className="flex-grow flex justify-center items-center my-12">
        <SignUp fallbackRedirectUrl={'/'} />
      </div>
      <footer className="w-full text-center py-8 bg-gray-900 text-gray-400 text-sm border-t border-gray-800 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-white">Spotify AI Playlist Creator</span>
        </div>
        <div>
          by{" "}
          <a href="https://github.com/viIdhjarta" className="text-green-400 hover:underline">
            vildhjarta
          </a>
        </div>
      </footer>
    </div>
  )
}

export default SignUpPage
