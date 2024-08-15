import { genUUID } from 'electric-sql/util';
import { create } from 'zustand';

import { ASYMMETRIC_KEYPAIR_LOCALSTORAGE_KEY } from '@/config';
import {
  exportAsymmetricKey,
  type ExportedAsymmetricKeypair,
  generateAsymmetricKeyPair,
  importAsymmetricKeyPair,
} from '@/lib/crypto';
import { useElectric } from '@/lib/electric';

export type PersistedCryptoKeysState = {
  keypair: CryptoKeyPair | null;
  id: string | null;
  initialized: boolean;
  initializing: boolean;
};

export type PersistedPublicKey = ExportedAsymmetricKeypair & { id: string };

export const usePersistedCryptoKeysState = create<PersistedCryptoKeysState>(() => ({
  keypair: null,
  initialized: false,
  id: null,
  initializing: false,
}));

export const usePersistedCryptoKeys = () => {
  const { keypair, id } = usePersistedCryptoKeysState();
  const { db } = useElectric()!;

  const createAsymmetricKeypair = async (userId: string) => {
    const { initialized, initializing } = usePersistedCryptoKeysState.getState();
    if (initialized || initializing) {
      return;
    }
    usePersistedCryptoKeysState.setState({ initializing: true });
    try {
      // create a keypair
      const keypair = await generateAsymmetricKeyPair();
      // export that key
      const exported = await exportAsymmetricKey(keypair);
      const id = genUUID();
      // write to db
      await db.public_keys.create({
        data: {
          id,
          created_at: new Date(),
          updated_at: new Date(),
          value: exported.publicKey,
          electric_user_id: userId,
        },
      });
      localStorage.setItem(
        ASYMMETRIC_KEYPAIR_LOCALSTORAGE_KEY,
        JSON.stringify({ ...exported, id }),
      );
      usePersistedCryptoKeysState.setState({
        keypair,
        id,
        initialized: true,
        initializing: false,
      });
    } catch (error) {
      console.error(error);
      usePersistedCryptoKeysState.setState({ initializing: false });
    }
  };

  const initializePersistedKeypair = async (userId: string) => {
    const { initialized, initializing } = usePersistedCryptoKeysState.getState();
    if (initialized || initializing) {
      console.log('returning from initializePersistedKeypair');
      return;
    }
    usePersistedCryptoKeysState.setState({ initializing: true });
    try {
      const persisted = localStorage.getItem(ASYMMETRIC_KEYPAIR_LOCALSTORAGE_KEY);
      if (!persisted) {
        console.log('creating a new keypair');
        return createAsymmetricKeypair(userId);
      }
      const parsed = JSON.parse(persisted) as PersistedPublicKey;
      const keypair = await importAsymmetricKeyPair(parsed.publicKey, parsed.privateKey);
      console.log('importing keypair');
      const dbRecord = await db.public_keys.findFirst({ where: { id: parsed.id } });
      if (!dbRecord) {
        throw new Error(`expected db public key to be defined, got ${dbRecord}`);
      }
      usePersistedCryptoKeysState.setState({
        keypair,
        id: parsed.id,
        initialized: true,
        initializing: false,
      });
    } catch (error) {
      console.error(error);
      localStorage.removeItem(ASYMMETRIC_KEYPAIR_LOCALSTORAGE_KEY);
      throw error;
    }
  };

  return { keypair, id, createAsymmetricKeypair, initializePersistedKeypair };
};
