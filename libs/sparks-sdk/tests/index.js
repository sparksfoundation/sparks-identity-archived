import util from "tweetnacl-util";
import { blake3 } from '@noble/hashes/blake3';
import { Identity } from "../lib/agents/index.js";
import * as forge from "../lib/forge/index.js";
import assert from 'node:assert';

(async function () {
  const identity = new Identity()
  let keyPairs, nextKeyPairs, password
  password = 'password'

  keyPairs = await forge.random()
  nextKeyPairs = await forge.password({ password, identity })
  await identity.incept({ keyPairs, nextKeyPairs: nextKeyPairs })

  keyPairs = { ...nextKeyPairs }
  nextKeyPairs = await forge.password({ password, identity})
  await identity.rotate({ keyPairs, nextKeyPairs: nextKeyPairs })

  password = 'test'
  keyPairs = { ...nextKeyPairs }
  nextKeyPairs = await forge.password({ password, identity})
  await identity.rotate({ keyPairs, nextKeyPairs: nextKeyPairs })

  keyPairs = { ...nextKeyPairs }
  nextKeyPairs = await forge.password({ password, identity})
  await identity.rotate({ keyPairs, nextKeyPairs: nextKeyPairs })

  const events = identity.keyEventLog;
  events.forEach((event, index) => {
    // what's happening here... it's checking that the event hasn't been tampered with
    const { selfAddressingIdentifier, version, ...eventBody } = event;
    const message = util.encodeBase64(blake3(JSON.stringify(eventBody)));
    const dataInTact = identity.verify({
      message,
      signature: selfAddressingIdentifier,
      publicKey: event.signingKeys[0],
    });
    assert.equal(dataInTact, true, 'data integrity failed')
    console.log('passed: data integrity')

    // let's check that the current key is the same as the previous committed to using
    if (index > 0) {
      const keyCommittment = events[index - 1].nextKeyCommitments[0];
      const currenKey = util.encodeBase64(
        blake3(util.decodeBase64(event.signingKeys[0])),
      );
      const committmentValid = currenKey === keyCommittment;
      assert.equal(committmentValid, true, 'key commitment failed')
      console.log('passed: key commitment')
    }
  });
}())