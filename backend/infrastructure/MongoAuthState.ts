import mongoose from "mongoose";
import { proto, initAuthCreds } from "@whiskeysockets/baileys";

const sessionSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  creds: { type: Object, required: true },
  keys: { type: Object, required: true },
});

const Session = mongoose.model("Session", sessionSchema);

type KeysType = Record<string, Record<string, any>>;

function serialize(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (Buffer.isBuffer(value)) {
        return { _isBuffer: true, data: value.toString("base64") };
      }
      return value;
    })
  );
}

function deserialize(obj: any) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj), (key, value) => {
    if (
      value &&
      typeof value === "object" &&
      value.type === "Buffer" &&
      Array.isArray(value.data)
    ) {
      return Buffer.from(value.data);
    }
    return value;
  });
}

export async function useMongoAuthState(number: string) {
  const session = await Session.findOne({ number }).lean();

  const creds = session?.creds ? deserialize(session.creds) : initAuthCreds();
  const keys: KeysType = session?.keys ? deserialize(session.keys) : {};

  async function saveCreds() {
    await Session.updateOne(
      { number },
      { creds: serialize(creds), keys: serialize(keys) },
      { upsert: true }
    );
  }

  const state = {
    creds,
    keys: {
      get: async (type: string, ids: string[]) => {
        const data: Record<string, any> = {};
        for (const id of ids) {
          let value = keys[type]?.[id];
          if (type === "app-state-sync-key" && value) {
            value = proto.Message.AppStateSyncKeyData.fromObject(value);
          }
          data[id] = value || null;
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

