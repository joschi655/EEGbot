import {test,expect} from 'bun:test';
import {handleRequest} from '../../ui/server';
test('pilot routing defaults deny and old intake stays public-disabled',async()=>{const old=process.env.EEGBOT_PILOT;delete process.env.EEGBOT_PILOT;expect((await handleRequest(new Request('http://localhost/pilot/'))).status).toBe(403);process.env.EEGBOT_PUBLIC='1';expect((await handleRequest(new Request('http://localhost/api/intake',{method:'POST'}))).status).toBe(403);if(old)process.env.EEGBOT_PILOT=old;});
