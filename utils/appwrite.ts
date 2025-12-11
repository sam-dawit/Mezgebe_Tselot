import { Account, Client, Databases } from 'react-native-appwrite';

const client = new Client();

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const platform = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM ?? 'com.mezgebe.tselot';

if (!endpoint || !projectId) {
  console.warn(
    'Missing Appwrite env vars: EXPO_PUBLIC_APPWRITE_ENDPOINT and/or EXPO_PUBLIC_APPWRITE_PROJECT_ID.'
  );
}

client.setEndpoint(endpoint ?? '').setProject(projectId ?? '').setPlatform(platform);

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
