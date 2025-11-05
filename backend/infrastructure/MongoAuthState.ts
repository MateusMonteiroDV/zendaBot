import mongoose from "mongoose";
import { initAuthCreds } from "@whiskeysockets/baileys";

const sessionSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  creds: { type: Object, required: true },
  keys: { type: Object, required: true },
});

const Session = mongoose.model("Session", sessionSchema);

type KeysType = {
  [category: string]: { [id: string]: any };
};

export async function useMongoAuthState(number: string) {
  let session = await Session.findOne({ number }).lean();

  let creds = session?.creds ? JSON.parse(JSON.stringify(session.creds)) : initAuthCreds();
  let keys: KeysType = session?.keys ? JSON.parse(JSON.stringify(session.keys)) : {};

  async function saveCreds() {
    await Session.updateOne(
      { number },
      { creds: JSON.parse(JSON.stringify(creds)), keys: JSON.parse(JSON.stringify(keys)) },
      { upsert: true }
    );
  }

  const state = {
    creds,
    keys: {
      get: async (type: string, ids: string[]) => {
        const data: { [id: string]: any } = {};
        for (const id of ids) {
          data[id] = keys[type]?.[id] || null;
        }
        return data;
      },
      set: async (data: KeysType) => {
        for (const category in data) {
          keys[category] = keys[category] || {};
          Object.assign(keys[category], data[category]);
        }
        await saveCreds();
      },
    },
  };

  return { state, saveCreds };
}

