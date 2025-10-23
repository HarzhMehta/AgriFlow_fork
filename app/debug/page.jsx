'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function DebugPage() {
  const { user, isLoaded } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isLoaded || !user) return;

      try {
        // Fetch regular profile endpoint
        const profileRes = await fetch('/api/user/profile');
        const profileJson = await profileRes.json();
        setProfileData(profileJson);

        // Fetch debug endpoint
        const debugRes = await fetch('/api/debug/profile');
        const debugJson = await debugRes.json();
        setDebugData(debugJson);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div className="p-8">Loading Clerk...</div>;
  }

  if (!user) {
    return <div className="p-8">Not logged in</div>;
  }

  if (loading) {
    return <div className="p-8">Loading profile data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Debug Info</h1>
        
        {/* Clerk User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Clerk User Info</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName,
            }, null, 2)}
          </pre>
        </div>

        {/* Profile API Response */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">GET /api/user/profile Response</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>

        {/* Debug API Response */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">GET /api/debug/profile Response (Raw DB Data)</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>

        {/* Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Analysis</h2>
          
          {debugData?.checks && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={debugData.checks.hasProfileCompletedFlag ? 'text-green-600' : 'text-red-600'}>
                  {debugData.checks.hasProfileCompletedFlag ? '✅' : '❌'}
                </span>
                <span>profileCompleted flag = {String(debugData.rawData?.profileCompleted)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={debugData.checks.hasUsername ? 'text-green-600' : 'text-red-600'}>
                  {debugData.checks.hasUsername ? '✅' : '❌'}
                </span>
                <span>username = {debugData.checks.usernameValue || '(empty)'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={debugData.checks.hasLocation ? 'text-green-600' : 'text-red-600'}>
                  {debugData.checks.hasLocation ? '✅' : '❌'}
                </span>
                <span>location = {debugData.checks.locationValue || '(empty)'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={debugData.checks.hasFieldSize ? 'text-green-600' : 'text-red-600'}>
                  {debugData.checks.hasFieldSize ? '✅' : '❌'}
                </span>
                <span>fieldSize = {debugData.checks.fieldSizeValue || '(empty)'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={debugData.checks.hasCropsGrown ? 'text-green-600' : 'text-red-600'}>
                  {debugData.checks.hasCropsGrown ? '✅' : '❌'}
                </span>
                <span>cropsGrown = {JSON.stringify(debugData.checks.cropsGrownValue)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={debugData.checks.hasClimate ? 'text-green-600' : 'text-red-600'}>
                  {debugData.checks.hasClimate ? '✅' : '❌'}
                </span>
                <span>climate = {debugData.checks.climateValue || '(empty)'}</span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="font-bold text-lg">
                  {profileData?.data?.profileCompleted ? (
                    <span className="text-green-600">✅ Profile should be COMPLETE</span>
                  ) : (
                    <span className="text-red-600">❌ Profile is INCOMPLETE</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
