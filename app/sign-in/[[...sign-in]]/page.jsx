import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to AgriFlow AI 🌾
          </h1>
          <p className="text-gray-600">
            Your intelligent agricultural assistant
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl rounded-2xl"
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
