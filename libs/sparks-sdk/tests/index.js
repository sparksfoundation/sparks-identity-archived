import util from "tweetnacl-util";
import { blake3 } from '@noble/hashes/blake3';
import { Identity } from "../lib/agents/index.js";
import * as forge from "../lib/forge/index.js";
import assert from 'node:assert';
import { MockTarget } from "./mocks/Target.js";
import { PostMessage } from "../lib/channels/index.js";

(async function () {
  const identity = new Identity()
  let keyPairs, nextKeyPairs, password
  password = 'password'

  keyPairs = forge.random()
  nextKeyPairs = await forge.password({ password, identity })
  identity.incept({ keyPairs, nextKeyPairs })

  keyPairs = { ...nextKeyPairs }
  nextKeyPairs = await forge.password({ password, identity })
  identity.rotate({ keyPairs, nextKeyPairs: nextKeyPairs })

  password = 'newpassword'
  keyPairs = { ...nextKeyPairs }
  nextKeyPairs = await forge.password({ password, identity })
  identity.rotate({ keyPairs, nextKeyPairs: nextKeyPairs })

  keyPairs = { ...nextKeyPairs }
  nextKeyPairs = await forge.password({ password, identity })
  identity.rotate({ keyPairs, nextKeyPairs: nextKeyPairs })

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

  const encrypted = identity.encrypt({ data: 'hello world' })
  const decrypted = identity.decrypt({ data: encrypted })
  assert.equal(decrypted, 'hello world', 'encryption/decryption failed')
  console.log('passed: encryption/decryption')

  identity.destroy()
  assert.equal(identity.keyEventLog[identity.keyEventLog.length - 1].eventType, 'destruction', 'destroy failed')
  console.log('passed: destroy')

  const alice = new Identity()
  keyPairs = forge.random()
  nextKeyPairs = await forge.random()
  alice.incept({ keyPairs, nextKeyPairs })

  const bob = new Identity()
  keyPairs = forge.random()
  nextKeyPairs = await forge.random()
  bob.incept({ keyPairs, nextKeyPairs })

  // give alice a mock window at port 4000
  global.window = new MockTarget('http://localhost:4000');
  const aliceConn = alice.addConnection(PostMessage)

  // give bob a mock window at port 3000
  global.window = new MockTarget('http://localhost:3000');
  const bobConn = bob.addConnection(PostMessage)

  // bob accepts alice's connection request
  bobConn.accept({ url: 'http://localhost:4000' })

  // alice connects to bob
  bobConn.on('connected', () => {
    console.log('passed: connection')
  })

  await aliceConn.connect({ url: 'http://localhost:3000' })
  aliceConn.send({ data: 'hello bob' })

  console.log('passed: all tests')
}())