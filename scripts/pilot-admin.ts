#!/usr/bin/env bun
/** Local operator only. Never expose this command as an HTTP endpoint. */
import { Store } from '../src/pilot/pilot';
import { randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync, chmodSync } from 'node:fs';
const [action,id]=process.argv.slice(2);
if(!['invite','revoke','status'].includes(action)|| (action!=='status'&&!/^[a-zA-Z0-9_-]{1,60}$/.test(id||'')))throw Error('Usage: pilot-admin.ts invite|revoke <stable-person-id> | status');
const db=process.env.EEGBOT_PILOT_DB||'/var/lib/eegbot-pilot/quota.sqlite';const store=new Store(db);
if(action==='invite'){const token=randomBytes(36).toString('base64url');store.invite(id,token,Date.now()+30*86400000);const dir='/home/ubuntu/.config/eegbot-pilot/invitations';mkdirSync(dir,{recursive:true,mode:0o700});const file=dir+'/'+id+'.txt';writeFileSync(file,'https://eegbot.aiwerke.de/pilot/\nPersönlicher Code (nicht weitergeben):\n'+token+'\n',{mode:0o600,flag:'wx'});chmodSync(file,0o600);console.log('Invitation saved privately:',file);}
if(action==='revoke'){store.revoke(id);console.log('Revoked:',id);}
if(action==='status')console.log(store.db.query('SELECT id,used,expires,revoked FROM invites').all());
