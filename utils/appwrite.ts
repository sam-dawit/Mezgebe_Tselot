import { Account, Client, Databases } from 'react-native-appwrite';

const client = new Client();

client
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('68edbc570028c0ac3e8b')
    .setPlatform('com.mezgebe.tselot');

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
